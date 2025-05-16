import { spawn } from "node:child_process";
import { GitCommand } from "./commands/utils";
import { log } from "../../logger";

const debug = log("git");

export const execGit = <T>(
	cmd: GitCommand<T>,
	gitPath: string,
	repoPath: string,
	onError: (e: unknown) => unknown,
): T => {
	debug(gitPath, cmd.args);

	const child = spawn(gitPath, cmd.args, {
		cwd: repoPath,
	});

	child.on("error", (e) => onError(e));

	return cmd.parse(
		child.stdout,
		new Promise((resolve) => {
			child.on("exit", (...args) => resolve(args));
		}),
	);
};
