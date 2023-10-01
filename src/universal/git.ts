export type GitCommit = {
	hash: string;
	parents: string[];
	subject: string;
	author: string;
	authorEmail: string;
	authorDate: number;
	commitDate: number;
	files: GitCommitFile[];
};

export type GitRef =
	| { hash: string; type: "tag"; name: string }
	| { hash: string; type: "branch"; name: string; remote?: string }
	| { hash: string; type: "head" }
	| { hash: string; type: "stash" };

export type GitCommitFile = {
	path: string;
	mode: GitFileMode;
};

export type GitFileMode = "M" | "T" | "A" | "D" | "R" | "C" | "U" | "?" | "!";

export type GitIndex = {
	parents: string[];
	tracked: GitCommitFile[];
	untracked: GitCommitFile[];
};
