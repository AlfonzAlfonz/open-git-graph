import { Backend } from "./createBackend";
import * as vscode from "vscode";

export type Command<TId extends string, TArgs extends any[]> = {
	id: TId;
	command: (backend: Backend) => (...args: TArgs) => Promise<void>;
};

export const command = <TId extends string, TArgs extends any[]>(
	command: Command<TId, TArgs>,
) => {
	return {
		...command,
		command:
			(backend: Backend) =>
			(...args: Parameters<ReturnType<Command<TId, TArgs>["command"]>>) => {
				console.info("");
				console.info(`Executing command "${command.id}"`);

				return command.command(backend)(...args);
			},
	};
};

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
	if (batchArray.length) {
		yield batchArray;
	}
}

export const only = <T>(x: T | T[]) => (Array.isArray(x) ? x[0] : x);

export const signalDisposable = (
	signal: AbortSignal,
	...disposables: vscode.Disposable[]
) => {
	signal.addEventListener("abort", () => {
		disposables.forEach((d) => d.dispose());
	});
};

export async function* take<T>(iterator: AsyncIterator<T>, count: number) {
	let i = 0;
	while (i < count) {
		const result = await iterator.next();
		if (result.done) {
			return result.value;
		} else {
			yield result.value;
		}
		i++;
	}
}

export const debugIterator = <T, TReturn, TNext>(
	iterator: AsyncIterator<T, TReturn, TNext>,
) => {
	return {
		__nextCalls: [] as {
			done: boolean;
			result: IteratorResult<T> | undefined;
		}[],
		__returnCall: undefined,
		__throwCall: undefined,

		async next(next: TNext) {
			const x = { done: false, result: undefined } as any;
			this.__nextCalls.push(x);
			const result = await iterator.next(next);
			x.result = result;
			x.done = true;
			return result;
		},
		return: iterator.return
			? async function (this: any, value: TReturn) {
					const result = await iterator.return!(value);
					this.__returnCall = result;
					return result;
			  }
			: undefined,
		throw: iterator.throw
			? async function (this: any, e: unknown) {
					const result = await iterator.throw!(e);
					this.__throwCall = result;
					return result;
			  }
			: undefined,
	};
};

export async function* pipeThrough<T, U>(
	ait: AsyncIterator<T>,
	transform: Iterator<U, void, Iterable<T>>,
	batchSize: number = 50,
) {
	const iterator = batch({ [Symbol.asyncIterator]: () => ait }, batchSize);

	while (true) {
		const batched = await iterator.next();

		const result = transform.next(batched.done ? [] : batched.value);
		if (result.done) {
			return;
		} else {
			yield result.value;
		}
	}
}
