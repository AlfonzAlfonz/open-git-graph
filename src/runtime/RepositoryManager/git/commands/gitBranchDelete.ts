import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type DeleteBranchOptions = {
	force?: boolean;
};

export const gitBranchDelete = (
	branch: string,
	{ force }: DeleteBranchOptions,
): GitCommand<Promise<void>> => ({
	args: ["branch", "--delete", force ? "--force" : null, branch],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
