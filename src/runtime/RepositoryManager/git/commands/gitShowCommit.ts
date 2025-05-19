import { GitCommit } from "../../../../universal/git";
import { gitLogCommits } from "./gitLogCommits";
import { commitFormat, GitCommand } from "./utils";

export const gitShowCommit = (
	hash: string,
): GitCommand<Promise<GitCommit>> => ({
	args: [
		"-c",
		"log.showSignature=false",
		"show",
		`--format=${commitFormat}`,
		"-m",
		"--raw",
		hash,
	],
	async parse(stdout, process) {
		for await (const data of gitLogCommits().parse(stdout, process)) {
			return data;
		}
		throw new Error("No file found");
	},
});
