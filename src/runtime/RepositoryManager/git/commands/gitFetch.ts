import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export const gitFetch = (): GitCommand<Promise<void>> => ({
	args: ["fetch"],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
