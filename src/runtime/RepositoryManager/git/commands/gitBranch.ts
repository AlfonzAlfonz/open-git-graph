import { toLineGenerator } from "../toLineGenerator";
import { GitCommand } from "./utils";

export const gitBranch = () =>
	({
		args: ["branch", "--list", "--format", "%(refname)"],
		parse: async function* (stdout) {
			const lines = toLineGenerator(stdout);
			const _ = await lines.next();
			const __ = await lines.next();
			for await (const ln of lines) {
				yield ln;
			}
		},
	}) satisfies GitCommand<AsyncIterableIterator<string>>;
