import { Queue } from "asxnc/Queue";
import { Readable } from "node:stream";

// TODO: maybe rewrite this to use "data" event instead
export function toLineGenerator(
	stream: Readable,
): AsyncIterableIterator<string, void, unknown> {
	const queue = Queue.create<string>();
	let current = "";

	stream.on("readable", () => {
		while (true) {
			const chunk = stream.read();
			if (chunk === null) break;

			let str = String(chunk);

			while (true) {
				const index = str.indexOf("\n");
				if (index === -1) {
					current += str;
					break;
				}
				const line = current + str.slice(0, index);
				queue.dispatch(line);
				current = "";
				str = str.slice(index + 1);
			}
		}
	});
	stream.on("end", () => {
		if (current) {
			queue.dispatch(current, false);
		}
		queue.dispatch(undefined, true);
	});

	return queue.iterator;
}
