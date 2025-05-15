import { GitCommand } from "./utils";
import { buffer } from "stream/consumers";

export const gitLogHeadHash = (): GitCommand<Promise<string>> => ({
	args: ["log", `--format=%H`, "-n", "1"],
	async parse(stdout) {
		return (await buffer(stdout)).toString("utf-8").trim();
	},
});
