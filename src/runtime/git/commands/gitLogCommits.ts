import { GitCommit, GitFileMode } from "../../../universal/git.js";
import { toLineGenerator } from "../toLineGenerator.js";
import { GitCommand, commitFormat, parseCommitFormat } from "./utils.js";

export const gitLogCommits = (
	logFiles: boolean = true,
): GitCommand<AsyncIterable<GitCommit>> => {
	return {
		args: [
			"-c",
			"log.showSignature=false",
			"log",
			"--branches=*",
			"--remotes=*",
			"--tags=*",
			"--date-order",
			`--format=${commitFormat}`,
			"-m",
			...(logFiles ? ["--raw"] : []),
		],
		parse: async function* (stdout) {
			const lines = toLineGenerator(stdout);

			let { value: value, done } = await lines.next();
			while (true) {
				if (done || value === undefined) {
					return;
				}

				if (logFiles && value === "") {
					throw new Error(
						"invalid format, commit line expected, empty line instead",
					);
				}

				const base = parseCommitFormat(value);

				({ value, done } = await lines.next());

				const files = [];
				if (logFiles) {
					if (value === "" && !done) {
						while (true) {
							({ value, done } = await lines.next());
							if (done || !value!.startsWith(":")) break;

							type SplittedCommitFile = [
								string,
								string,
								string,
								string,
								GitFileMode,
								string,
							];
							const [, , , , mode, path] = value!.split(
								/\s+/,
							) as SplittedCommitFile;
							files.push({ mode, path });
						}
					}
				}

				yield { ...base, files };
			}
		},
	};
};
