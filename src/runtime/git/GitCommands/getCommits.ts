import { GitCommit } from "../../../types/git";
import { toLineGenerator } from "../toLineGenerator";
import { FORMAT_SEPARATOR, GitCommand, formatMsg } from "./utils";

export const getCommits = (): GitCommand<AsyncIterable<GitCommit>> => {
	return {
		args: [
			"-c",
			"log.showSignature=false",
			"log",
			"--branches=*",
			"--remotes=*",
			"--tags=*",
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
						const [, , , , mode, path] = value!.split(
							/\s+/,
						) as SplittedCommitFile;
						files.push({ mode, path });
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
};
