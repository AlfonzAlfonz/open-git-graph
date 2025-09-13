import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type PushDeleteOptions = {
	force?: boolean;
};

export const gitPushDelete = (
	origin: string,
	branches: string | string[],
	{ force }: PushDeleteOptions,
): GitCommand<Promise<void>> => ({
	args: [
		"push",
		"--delete",
		force ? "--force" : null,
		origin,
		...(typeof branches === "string" ? [branches] : branches),
	],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
