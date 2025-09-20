import { toLineGenerator } from "../toLineGenerator";
import { GitCommand } from "./utils";

export const gitLogGrep = (
	pattern: string,
): GitCommand<AsyncIterable<string>> => {
	return {
		args: [
			"-c",
			"log.showSignature=false",
			"log",
			"--branches=*",
			"--remotes=*",
			"--tags=*",
			"--date-order",
			`--format=%H`,
			"-m",
			`--grep=${pattern}`,
			"HEAD",
		],
		parse: (stdout) => {
			return toLineGenerator(stdout);
		},
	};
};
