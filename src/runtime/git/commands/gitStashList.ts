import { GitCommit } from "../../../universal/git";
import { gitLogCommits } from "./gitLogCommits";
import { GitCommand, commitFormat } from "./utils";

export const gitStashList = (): GitCommand<AsyncIterable<GitCommit>> => {
	return {
		args: [
			"-c",
			"log.showSignature=false",
			"stash",
			"list",
			`--format=${commitFormat}`,
			"-m",
			"--raw",
		],
		parse: gitLogCommits().parse,
	};
};
