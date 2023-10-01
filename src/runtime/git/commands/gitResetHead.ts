import { errors } from "../../handleError.js";
import { GitCommand } from "./utils.js";

export type GitResetMode = "soft" | "mixed" | "hard";

export const gitResetHead = (
	ref: string,
	mode: GitResetMode,
): GitCommand<Promise<void>> => ({
	args: ["reset", `--${mode}`, ref],
	async parse(_, p) {
		const [code] = await p;
		if (code && code !== 0) {
			throw errors.gitFailed(code);
		}
	},
});
