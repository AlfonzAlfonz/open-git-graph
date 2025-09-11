import { GitFileMode, GitStatus } from "../../../../universal/git";
import { toLineGenerator } from "../toLineGenerator";
import { GitCommand } from "./utils";

export const gitStatus = () =>
	({
		args: ["status", "--porcelain=1", "-b"],
		async parse(stdout) {
			const lines = toLineGenerator(stdout);

			const branch = await lines.next();

			if (branch.done || !branch.value.startsWith("## ")) {
				throw new Error(`Invalid status output: ${branch.value}`);
			}

			const status: GitStatus = {
				branch: parseBranch(branch.value),
				tracked: [],
				untracked: [],
			};

			for await (const l of lines) {
				const trackedMode = l[0] as GitFileMode | " ";
				const untrackedMode = l[1] as GitFileMode | " ";
				const path = l.slice(3);

				if (trackedMode !== " ")
					status.tracked.push({ mode: trackedMode, path });
				if (untrackedMode !== " ")
					status.untracked.push({ mode: untrackedMode, path });
			}

			return status;
		},
	}) satisfies GitCommand<Promise<GitStatus>>;

const parseBranch = (str: string) => {
	if (str === "## HEAD (no branch)") {
		return undefined;
	}

	const end = str.indexOf("...");

	if (end === -1) {
		return str.slice("## ".length);
	}

	return str.slice("## ".length, end);
};
