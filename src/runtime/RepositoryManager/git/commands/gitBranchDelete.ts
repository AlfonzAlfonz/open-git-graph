import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type DeleteBranchOptions = {
	force?: boolean;
	remotes?: boolean;
};

export const gitBranchDelete = (
	branch: string,
	{ force, remotes }: DeleteBranchOptions,
): GitCommand<Promise<void>> => ({
	args: [
		"branch",
		"--delete",
		force ? "--force" : null,
		remotes ? "--remotes" : "",
		branch,
	],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
