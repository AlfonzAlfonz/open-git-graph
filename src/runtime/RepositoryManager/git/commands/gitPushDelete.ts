import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export const gitPushDelete = (
	origin: string,
	branches: string | string[],
): GitCommand<Promise<void>> => ({
	args: [
		"push",
		"--delete",
		origin,
		...(typeof branches === "string" ? [branches] : branches),
	],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
