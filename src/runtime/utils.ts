import * as vscode from "vscode";
import { Lazy, RuntimeStore } from "./state/types";

export type Command<TId extends string> = {
	id: TId;
	command: (
		context: vscode.ExtensionContext,
		store: Lazy<RuntimeStore>,
	) => () => void;
};

export const command = <TId extends string>(command: Command<TId>) => command;

export const buffer = async <T>(iterable: AsyncIterable<T>) => {
	const result = [];
	for await (const itm of iterable) {
		result.push(itm);
	}
	return result;
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
