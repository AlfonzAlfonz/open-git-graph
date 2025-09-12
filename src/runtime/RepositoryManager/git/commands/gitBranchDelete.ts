import { errors } from "../../../handleError";
import { GitCommand } from "./utils";

export const gitBranchDelete = (
	branch: string,
	force?: boolean,
): GitCommand<Promise<void>> => ({
	args: ["branch", "--delete", ...(force ? "--force" : ""), branch],
	async parse(_, p) {
		const [code] = await p;
		if (code && code !== 0) {
			throw errors.gitFailed(code);
		}
	},
});
