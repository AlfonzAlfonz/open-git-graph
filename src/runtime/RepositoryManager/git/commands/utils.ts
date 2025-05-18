import { Readable } from "node:stream";
import { GitCommit } from "../../../../universal/git";

export type GitCommand<T> = {
	args: string[];
	parse: (
		stdout: Readable,
		process: Promise<[exitCode: number | null, signal: NodeJS.Signals | null]>,
	) => T;
};

export const FORMAT_SEPARATOR = "XX7Nal-YARtTpjCikii9nJxER19D6diSyk-AWkPb";
export const commitFormat = ["%H", "%P", "%aN", "%aE", "%at", "%s", "%ct"].join(
	FORMAT_SEPARATOR,
);

export const parseCommitFormat = (value: string): Omit<GitCommit, "files"> => {
	type SplittedCommitHeader = [
		string,
		string,
		string,
		string,
		string,
		string,
		string,
	];
	const [hash, parents, author, authorEmail, authorDate, subject, commitDate] =
		value!.split(FORMAT_SEPARATOR) as SplittedCommitHeader;

	return {
		hash,
		parents: parents.split(" ").filter(Boolean),
		subject,
		author,
		authorDate: +authorDate,
		authorEmail,
		commitDate: +commitDate,
	};
};
