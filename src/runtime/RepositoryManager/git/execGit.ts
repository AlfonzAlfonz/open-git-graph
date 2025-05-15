import { spawn } from "node:child_process";
import { GitCommand } from "./commands/utils";

export const execGit = <T>(
	cmd: GitCommand<T>,
	gitPath: string,
	repoPath: string,
	onError: (e: unknown) => unknown,
): T => {
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
