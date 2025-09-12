import { errors } from "../../../handleError";
import { GitCommand } from "./utils";

export type GitResetMode = "soft" | "mixed" | "hard";

export const gitReset = (
	mode: "mixed" | "hard" | "soft",
	treeish: string,
): GitCommand<Promise<void>> => ({
	args: ["reset", `--${mode}`, treeish],
	async parse(_, p) {
		const [code, stdErr] = await p;
		if (code && code !== 0) {
			throw errors.gitFailed(code, stdErr);
		}
	},
});
