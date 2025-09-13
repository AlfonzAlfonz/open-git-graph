import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type GitResetMode = "soft" | "mixed" | "hard";

export type GitResetOptions = {
	mode: GitResetMode;
};

export const gitReset = (
	treeish: string,
	{ mode }: GitResetOptions,
): GitCommand<Promise<void>> => ({
	args: ["reset", `--${mode}`, treeish],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
