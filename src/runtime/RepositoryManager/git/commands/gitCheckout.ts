import { errors } from "../../../handleError";
import { GitCommand } from "./utils";

export const gitCheckout = (branch: string): GitCommand<Promise<void>> => ({
	args: ["checkout", branch],
	async parse(_, p) {
		const [code] = await p;
		if (code && code !== 0) {
			throw errors.gitFailed(code);
		}
	},
});

export const gitCheckoutCreate = (branchName: string, startingPoint: string) =>
	({
		args: ["checkout", "-b", branchName, startingPoint],
		async parse(_, p) {
			const [code, stdErr] = await p;
			if (code && code !== 0) {
				throw errors.gitFailed(code, stdErr);
			}
		},
	}) satisfies GitCommand<Promise<void>>;
