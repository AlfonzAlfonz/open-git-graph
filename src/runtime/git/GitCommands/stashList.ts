import { GitCommit } from "../../../types/git";
import { logCommits } from "./logCommits";
import { GitCommand, commitFormat } from "./utils";

export const stashList = (): GitCommand<AsyncIterable<GitCommit>> => {
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
		parse: logCommits().parse,
	};
};
