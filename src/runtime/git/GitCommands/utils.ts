import { Readable } from "node:stream";

export type GitCommand<T> = {
	args: string[];
	parse: (
		stdout: Readable,
		process: Promise<[exitCode: number | null, signal: NodeJS.Signals | null]>,
	) => T;
};

export const FORMAT_SEPARATOR = "XX7Nal-YARtTpjCikii9nJxER19D6diSyk-AWkPb";
export const formatMsg = (...x: string[]) => x.join(FORMAT_SEPARATOR);
