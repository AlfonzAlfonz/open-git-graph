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

export type GitRef = GitRefTag | GitRefBranch | GitRefHead | GitRefStash;

export type GitRefTag = { hash: string; type: "tag"; name: string };
export type GitRefBranch = {
	hash: string;
	type: "branch";
	name: string;
	remote?: string;
};
export type GitRefHead = { hash: string; type: "head" };
export type GitRefStash = { hash: string; type: "stash" };

export type GitCommitFile = {
	path: string;
	mode: GitFileMode;
};

export type GitFileMode = "M" | "T" | "A" | "D" | "R" | "C" | "U" | "?" | "!";

export type GitIndex = {
	branch: string | undefined;
	parents: string[];
	tracked: GitCommitFile[];
	untracked: GitCommitFile[];
};

export type GitStatus = {
	branch: string | undefined;
	tracked: GitCommitFile[];
	untracked: GitCommitFile[];
};
