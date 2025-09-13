import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type GitResetMode = "soft" | "mixed" | "hard";

export const gitReset = (
	mode: "mixed" | "hard" | "soft",
	treeish: string,
): GitCommand<Promise<void>> => ({
	args: ["reset", `--${mode}`, treeish],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
