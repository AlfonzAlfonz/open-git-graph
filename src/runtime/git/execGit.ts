import { ChildProcess, spawn } from "child_process";
import { GitCommand } from "./GitCommands.js";

export const execGit = async <T>(cmd: GitCommand<T>): Promise<T> => {
	console.log(`git ${cmd.args.join(" ")}`);

	const c = await resolveSpawnOutput(
		spawn("git", cmd.args, {
			// cwd: "",
		}),
	);
	return cmd.parse(c.buffer);
};

export const resolveSpawnOutput = async (cmd: ChildProcess) => {
	const [status, buffer] = await Promise.all([
		new Promise<{ code: number; error: null } | { code: -1; error: Error }>(
			(resolve) => {
				// status promise
				let resolved = false;
				cmd.on("error", (error) => {
					if (resolved) {
						return;
					}
					resolve({ code: -1, error: error });
					resolved = true;
				});
				cmd.on("exit", (code) => {
					if (resolved) {
						return;
					}
					resolve({ code: code!, error: null });
					resolved = true;
				});
			},
		),
		new Promise<Buffer>((resolve) => {
			// stdout promise
			let buffers: Buffer[] = [];
			cmd.stdout?.on("data", (b: Buffer) => {
				buffers.push(b);
			});
			cmd.stdout?.on("close", () => resolve(Buffer.concat(buffers)));
		}),
	]);

	return { status, buffer };
};
