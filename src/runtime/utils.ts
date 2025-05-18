import { Backend } from "./createBackend";
import * as vscode from "vscode";

export type Command<TId extends string> = {
	id: TId;
	command: (backend: Backend) => () => Promise<void>;
};

export const command = <TId extends string>(command: Command<TId>) => {
	return {
		...command,
		command:
			(backend: Backend) =>
			(...args: Parameters<ReturnType<Command<TId>["command"]>>) => {
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
	return batchArray;
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
