export type GitCommit = {
	hash: string;
	parents: string[];
	subject: string;
	author: string;
	authorEmail: string;
	authorDate: string;
	files: GitCommitFile[];
};

export type GitRef =
	| { hash: string; type: "tag"; name: string }
	| { hash: string; type: "branch"; name: string; remote?: string }
	| { hash: string; type: "head" };

export type GitCommitFile = {
	path: string;
	mode: GitCommitFileMode;
};

export type GitCommitFileMode = "M" | "A" | "D" | "R" | "U";
