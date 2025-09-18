import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type TagOptions = {
	name: string;
	annotate: boolean;
	force: boolean;
	message: string;
	edit: boolean;
};

export const gitTag = (
	commitOrObject: string,
	{ name, annotate, force, message, edit }: TagOptions,
): GitCommand<Promise<void>> => ({
	args: [
		"tag",
		annotate ? "--annotate" : null,
		force ? "--force" : null,
		...(message !== undefined ? ["--message", message] : []),
		edit ? "--edit" : null,
		name,
		commitOrObject,
	],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
