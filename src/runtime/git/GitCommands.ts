import { GitCommit, GitRef } from "../../types/git";

export class GitCommands {
	public constructor() {}

	public getCommits(): GitCommand<Iterable<GitCommit>> {
		return {
			args: [
				"-c",
				"log.showSignature=false",
				"log",
				"--all",
				`--format=${formatMsg("%H", "%P", "%aN", "%aE", "%at", "%s")}`,
			],
			parse: function* (b) {
				const commits = b.toString("utf-8").split("\n");

				for (const c of commits) {
					if (c === "") {
						continue;
					}
					const [hash, parents, author, authorEmail, authorDate, subject] =
						c.split(FORMAT_SEPARATOR) as [
							string,
							string,
							string,
							string,
							string,
							string,
						];

					yield {
						hash,
						parents: parents.split(" ").filter(Boolean),
						subject,
						author,
						authorDate,
						authorEmail,
					};
				}
			},
		};
	}

	public getRefs(): GitCommand<Iterable<GitRef>> {
		return {
			args: ["show-ref", "--head", "--dereference"],
			parse: function* (b) {
				const str = b.toString("utf-8").split("\n").filter(Boolean);

				const TAG_PREFIX = "refs/tags/";
				const BRANCH_PREFIX = "refs/heads/";
				const REMOTE_BRANCH_PREFIX = "refs/remotes/";

				for (const ln of str) {
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

export type GitCommand<T> = {
	args: string[];
	parse: (b: Buffer) => T;
};
