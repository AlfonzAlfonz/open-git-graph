import readline from "node:readline";
import { Readable } from "node:stream";

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
