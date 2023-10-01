import { GitCommitFile, GitFileMode } from "../../../universal/git.js";
import { toLineGenerator } from "../toLineGenerator.js";
import { GitCommand } from "./utils.js";

export const gitStatus = (): GitCommand<
	AsyncIterable<[GitCommitFile | undefined, GitCommitFile | undefined]>
> => ({
	args: ["status", "--porcelain=1"],
	async *parse(stdout) {
		for await (const l of toLineGenerator(stdout)) {
			const trackedMode = l[0] as GitFileMode | " ";
			const untrackedMode = l[1] as GitFileMode | " ";
			const path = l.slice(3);

			yield [
				trackedMode !== " " ? { mode: trackedMode, path } : undefined,
				untrackedMode !== " " ? { mode: untrackedMode, path } : undefined,
			];
		}
	},
});
