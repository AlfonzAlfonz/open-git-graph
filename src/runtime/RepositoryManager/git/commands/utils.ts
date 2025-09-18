import { Readable } from "node:stream";
import { GitCommit } from "../../../../universal/git";

export type GitCommand<T> = {
	args: (string | null)[];
	parse: (stdout: Readable, process: Promise<GitProcessOutput>) => T;
};

export type GitProcessOutput = [
	exitCode: number | null,
	stderr: string,
	signal: NodeJS.Signals | null,
];

export const FORMAT_SEPARATOR = "<Ps3Nqv_iKCwmz>";
export const commitFormat = [
	"%H",
	"%P",
	"%aN",
	"%aE",
	"%at",
	"%s",
	"%ct",
	"%gd",
].join(FORMAT_SEPARATOR);

export const parseCommitFormat = (
	value: string,
): Omit<GitCommit, "files" | "type"> => {
	type SplittedCommitHeader = [
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
	];
	const [
		hash,
		parents,
		author,
		authorEmail,
		authorDate,
		subject,
		commitDate,
		reflogSelector,
	] = value!.split(FORMAT_SEPARATOR) as SplittedCommitHeader;

	return {
		hash,
		parents: parents.split(" ").filter(Boolean),
		subject,
		author,
		authorDate: +authorDate,
		authorEmail,
		commitDate: +commitDate,
		reflogSelector: reflogSelector || undefined,
	};
};
