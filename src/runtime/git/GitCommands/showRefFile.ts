import { buffer } from "node:stream/consumers";
import { GitCommand } from "./utils";

export const showRefFile = (
	ref: string,
	path: string,
): GitCommand<Promise<string>> => ({
	args: ["show", `${ref}:${path}`],
	parse(stdout) {
		return buffer(stdout).then((b) => b.toString("utf8"));
	},
});
