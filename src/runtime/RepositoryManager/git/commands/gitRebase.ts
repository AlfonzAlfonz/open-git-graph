import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type RebaseOptions = {
	interactive?: boolean;
	autosquash?: boolean;
};

export const gitRebase = (
	upstream: string,
	{ interactive, autosquash }: RebaseOptions,
): GitCommand<Promise<void>> => ({
	args: [
		"rebase",
		interactive ? "--interactive" : null,
		autosquash ? "--autosquash" : null,
		upstream,
	],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
