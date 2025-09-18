import { GitCommit } from "../../../../universal/git";
import { toLineGenerator } from "../toLineGenerator";
import { parseLogOutput } from "./gitLogCommits";
import { GitCommand, commitFormat } from "./utils";

export const gitStashList = (
	logFiles: boolean = true,
): GitCommand<AsyncIterable<GitCommit>> => {
	return {
		args: [
			"-c",
			"log.showSignature=false",
			"stash",
			"list",
			`--format=${commitFormat}`,
			"-m",
			...(logFiles ? ["--raw"] : []),
		],
		parse: (stdout) => {
			const lines = toLineGenerator(stdout);

			return parseLogOutput(lines, "stash", logFiles);
		},
	};
};
