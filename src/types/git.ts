export type GitCommit = {
	hash: string;
	parents: string[];
	subject: string;
	author: string;
	authorEmail: string;
	authorDate: string;
};

export type GitRef =
	| { hash: string; type: "tag"; name: string }
	| { hash: string; type: "branch"; name: string; remote?: string }
	| { hash: string; type: "head" };
