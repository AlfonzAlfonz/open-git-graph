import { buffer } from "node:stream/consumers";
import { GitCommand } from "./utils.js";

export const gitShowRefFile = (
	ref: string,
	path: string,
): GitCommand<Promise<string>> => ({
	args: ["show", `${ref}:${path}`],
	parse(stdout) {
		return buffer(stdout).then((b) => b.toString("utf8"));
	},
});
