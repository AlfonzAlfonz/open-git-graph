import { errors } from "../../../handleError";
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
		const [code] = await p;
		if (code && code !== 0) {
			throw errors.gitFailed(code);
		}
	},
});
