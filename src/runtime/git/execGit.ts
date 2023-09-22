import { spawn } from "child_process";
import readline from "readline";
import { Readable } from "stream";
import { GitCommand } from "./GitCommands.js";

export const execGit = <T>(cmd: GitCommand<T>): T => {
	console.info(`git ${cmd.args.join(" ")}`);

	const child = spawn("git", cmd.args, {
		// cwd: "",
	});

	return cmd.parse(child.stdout);
};

export async function* toLineGenerator(
	stream: Readable,
): AsyncGenerator<string, undefined, unknown> {
	let queue: string[] = [];
	let resolve = () => {
		console.error("empty resolve");
	};
	let promise = new Promise<void>((r) => (resolve = r));
	let done = false;

	const rl = readline.createInterface(stream);
	rl.on("line", (value) => {
		queue.push(value);
		resolve();
		promise = new Promise<void>((r) => (resolve = r));
	}).on("close", () => {
		done = true;
		resolve();
	});

	while (!done) {
		await promise;
		yield* queue as any;
		queue = [];
	}

	return undefined;
}
