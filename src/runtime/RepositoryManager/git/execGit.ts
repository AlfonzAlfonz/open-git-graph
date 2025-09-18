import { spawn } from "node:child_process";
import { GitCommand } from "./commands/utils";
import { log } from "../../logger";
import { buffer } from "node:stream/consumers";

const debug = log("git");

export const execGit = <T>(
	cmd: GitCommand<T>,
	gitPath: string,
	repoPath: string,
	onError: (e: unknown) => unknown,
): T => {
	const args = cmd.args.filter((a) => a !== null);

	debug(`${gitPath} ${args.join(" ")}`);

	const child = spawn(gitPath, args, {
		cwd: repoPath,
	});

	child.on("error", (e) => onError(e));

	return cmd.parse(
		child.stdout,
		Promise.all([
			new Promise<[number | null, NodeJS.Signals | null]>((resolve) => {
				child.on("exit", (code, signal) => resolve([code, signal]));
			}),
			buffer(child.stderr),
		]).then(([[code, signal], stderr]) => [code, stderr.toString(), signal]),
	);
};
