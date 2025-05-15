import { errors } from "../../../../runtime2/handleError";
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
