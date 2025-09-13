import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type MergeOptions = {
	ff?: boolean;
	noFf?: boolean;
	ffOnly?: boolean;
};

export const gitMerge = (
	target: string,
	{ ff, noFf, ffOnly }: MergeOptions,
): GitCommand<Promise<void>> => ({
	args: [
		"merge",
		ff ? "--ff" : null,
		noFf ? "--no-ff" : null,
		ffOnly ? "--ff-only" : null,
		target,
	],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
