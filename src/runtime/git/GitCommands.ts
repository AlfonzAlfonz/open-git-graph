import { Readable } from "node:stream";
import { GitCommit, GitRef } from "../../types/git.js";
import { toLineGenerator } from "./toLineGenerator.js";

export type GitCommand<T> = {
	args: string[];
	parse: (b: Readable) => T;
};

export class GitCommands {
	public static getCommits(): GitCommand<AsyncIterable<GitCommit>> {
		return {
			args: [
				"-c",
				"log.showSignature=false",
				"log",
				"--all",
				`--format=${formatMsg("%H", "%P", "%aN", "%aE", "%at", "%s")}`,
				"-m",
				"--raw",
			],
			parse: async function* (stdout) {
				const lines = toLineGenerator(stdout);

				let { value: value, done } = await lines.next();
				while (true) {
					if (done) {
						return;
					}

					if (value === "") {
						throw new Error(
							"invalid format, commit line expected, empty line instead",
						);
					}

					type SplittedCommitHeader = [
						string,
						string,
						string,
						string,
						string,
						string,
					];
					const [hash, parents, author, authorEmail, authorDate, subject] =
						value!.split(FORMAT_SEPARATOR) as SplittedCommitHeader;

					({ value, done } = await lines.next());

					const files = [];
					if (value === "" && !done) {
						while (true) {
							({ value, done } = await lines.next());
							if (done || !value!.startsWith(":")) break;

							type SplittedCommitFile = [
								string,
								string,
								string,
								string,
								string,
								string,
								string,
							];
							const [, , , , mode, filename] = value!.split(
								/\s+/,
							) as SplittedCommitFile;
							files.push({ mode, filename });
						}
					}

					yield {
						hash,
						parents: parents.split(" ").filter(Boolean),
						subject,
						author,
						authorDate,
						authorEmail,
						files,
					};
				}
			},
		};
	}

	public static getRefs(): GitCommand<AsyncIterable<GitRef>> {
		return {
			args: ["show-ref", "--head", "--dereference"],
			parse: async function* (stdout) {
				const lines = toLineGenerator(stdout);

				while (true) {
					const { value: ln, done } = await lines.next();

					if (done) return;

					const [hash, name] = ln.split(" ") as [string, string];

					if (name === "HEAD") {
						yield {
							hash,
							type: "head",
						};
					}
					if (name.startsWith(TAG_PREFIX) && name.endsWith("^{}")) {
						yield {
							hash,
							type: "tag",
							name: name.slice(TAG_PREFIX.length, -3),
						};
					}
					if (name.startsWith(BRANCH_PREFIX)) {
						yield {
							hash,
							type: "branch",
							name: name.slice(BRANCH_PREFIX.length),
						};
					}
					if (name.startsWith(REMOTE_BRANCH_PREFIX)) {
						const [remote, ...b] = name
							.slice(REMOTE_BRANCH_PREFIX.length)
							.split("/");
						yield {
							hash,
							type: "branch",
							name: b.join("/"),
							remote,
						};
					}
				}
			},
		};
	}
}

const FORMAT_SEPARATOR = "XX7Nal-YARtTpjCikii9nJxER19D6diSyk-AWkPb";
const formatMsg = (...x: string[]) => x.join(FORMAT_SEPARATOR);

const TAG_PREFIX = "refs/tags/";
const BRANCH_PREFIX = "refs/heads/";
const REMOTE_BRANCH_PREFIX = "refs/remotes/";
