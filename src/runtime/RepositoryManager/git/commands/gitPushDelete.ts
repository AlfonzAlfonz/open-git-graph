import { errors } from "../../../handleError";
import { GitCommand } from "./utils";

export const gitPushDelete = (
	origin: string,
	branch: string,
): GitCommand<Promise<void>> => ({
	args: ["push", "--delete", origin, branch],
	async parse(_, p) {
		const [code] = await p;
		if (code && code !== 0) {
			throw errors.gitFailed(code);
		}
	},
});
