import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type CherryPickOptions = {
	noCommit: boolean;
	recordOrigin: boolean;
	edit: boolean;
};

export const gitCherryPick = (
	commit: string,
	{ noCommit, recordOrigin, edit }: CherryPickOptions,
): GitCommand<Promise<void>> => ({
	args: [
		"cherry-pick",
		noCommit ? "--no-commit" : null,
		recordOrigin ? "-x" : null,
		edit ? "--edit" : null,
		commit,
	],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
