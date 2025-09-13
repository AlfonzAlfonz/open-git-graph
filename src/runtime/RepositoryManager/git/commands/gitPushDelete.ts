import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export const gitPushDelete = (
	origin: string,
	branch: string,
): GitCommand<Promise<void>> => ({
	args: ["push", "--delete", origin, branch],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
