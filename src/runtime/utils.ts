import { Backend } from "./createBackend";

export type Command<TId extends string> = {
	id: TId;
	command: (backend: Backend) => () => Promise<void>;
};

export const command = <TId extends string>(command: Command<TId>) => command;

export async function* batch<T>(
	iterable: AsyncIterable<T>,
	batchSize: number = 200,
) {
	let batchArray = [];
	for await (const itm of iterable) {
		batchArray.push(itm);
		if (batchArray.length >= batchSize) {
			yield batchArray;
			batchArray = [];
		}
	}
	return batchArray;
}

export const only = <T>(x: T | T[]) => (Array.isArray(x) ? x[0] : x);
