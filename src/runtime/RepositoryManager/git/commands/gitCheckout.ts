import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export const gitCheckout = (branch: string): GitCommand<Promise<void>> => ({
	args: ["checkout", branch],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});

export const gitCheckoutCreate = (branchName: string, startingPoint: string) =>
	({
		args: ["checkout", "-b", branchName, startingPoint],
		async parse(_, p) {
			GitError.throwOnFail(await p);
		},
	}) satisfies GitCommand<Promise<void>>;
