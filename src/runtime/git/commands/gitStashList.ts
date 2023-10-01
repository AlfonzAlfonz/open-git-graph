import { GitCommit } from "../../../universal/git.js";
import { gitLogCommits } from "./gitLogCommits.js";
import { GitCommand, commitFormat } from "./utils.js";

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
