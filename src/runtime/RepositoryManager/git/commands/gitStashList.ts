import { GitCommit } from "../../../../universal/git";
import { gitLogCommits } from "./gitLogCommits";
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
		parse: gitLogCommits().parse,
	};
};
