import { errors } from "../../../handleError";
import { GitCommand } from "./utils";

export const gitPull = (ffOnly: boolean): GitCommand<Promise<void>> => ({
	args: ["pull", ...(ffOnly ? ["--ff-only"] : [])],
	async parse(_, p) {
		const [code, stdErr] = await p;
		if (code && code !== 0) {
			throw errors.gitFailed(code, stdErr);
		}
	},
});
