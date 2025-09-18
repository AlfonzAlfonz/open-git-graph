import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type StashOptions = {
	index: boolean;
};

export const gitStashApply = (
	stash: string,
	{ index }: StashOptions,
): GitCommand<Promise<void>> => ({
	args: ["stash", "apply", index ? "--index" : null, stash],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});

export const gitStashPop = (
	stash: string,
	{ index }: StashOptions,
): GitCommand<Promise<void>> => ({
	args: ["stash", "pop", index ? "--index" : null, stash],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});

export const gitStashDrop = (stash: string): GitCommand<Promise<void>> => ({
	args: ["stash", "drop", stash],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
