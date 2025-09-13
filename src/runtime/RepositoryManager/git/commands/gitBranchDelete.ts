import { errors } from "../../../handleError";
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
		const [code] = await p;
		if (code && code !== 0) {
			throw errors.gitFailed(code);
		}
	},
});
