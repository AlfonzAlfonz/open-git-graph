import { toLineGenerator } from "../toLineGenerator";
import { GitCommand } from "./utils";

export const gitBranch = () =>
	({
		args: ["branch", "--list", "--format", "%(refname)"],
		parse: async function* (stdout) {
			const lines = toLineGenerator(stdout);
			for await (const ln of lines) {
				if (ln.startsWith("refs/heads/%(fieldname)") || ln.startsWith("(")) {
					continue;
				}
				yield ln;
			}
		},
	}) satisfies GitCommand<AsyncIterableIterator<string>>;
