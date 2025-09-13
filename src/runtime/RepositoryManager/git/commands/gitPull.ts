import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export const gitPull = (ffOnly: boolean): GitCommand<Promise<void>> => ({
	args: ["pull", ...(ffOnly ? ["--ff-only"] : [])],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
