import { toLineGenerator } from "../toLineGenerator";
import { GitCommand } from "./utils";

export const gitRemote = () =>
	({
		args: ["remote"],
		parse: async function* (stdout) {
			yield* toLineGenerator(stdout);
		},
	}) satisfies GitCommand<AsyncIterableIterator<string>>;
