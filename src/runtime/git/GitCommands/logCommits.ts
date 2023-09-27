import { GitCommit, GitCommitFileMode } from "../../../types/git";
import { toLineGenerator } from "../toLineGenerator";
import { GitCommand, commitFormat, parseCommitFormat } from "./utils";

export const logCommits = (): GitCommand<AsyncIterable<GitCommit>> => {
	return {
		args: [
			"-c",
			"log.showSignature=false",
			"log",
			"--branches=*",
			"--remotes=*",
			"--tags=*",
			`--format=${commitFormat}`,
			"-m",
			"--raw",
		],
		parse: async function* (stdout) {
			const lines = toLineGenerator(stdout);

			let { value: value, done } = await lines.next();
			while (true) {
				if (done || value === undefined) {
					return;
				}

				if (value === "") {
					throw new Error(
						"invalid format, commit line expected, empty line instead",
					);
				}

				const base = parseCommitFormat(value);

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
							GitCommitFileMode,
							string,
						];
						const [, , , , mode, path] = value!.split(
							/\s+/,
						) as SplittedCommitFile;
						files.push({ mode, path });
					}
				}

				yield { ...base, files };
			}
		},
	};
};
