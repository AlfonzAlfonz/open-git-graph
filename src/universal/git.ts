export type GitCommit = {
	hash: string;
	parents: string[];
	subject: string;
	author: string;
	authorEmail: string;
	authorDate: number;
	commitDate: number;
	files: GitCommitFile[];
	reflogSelector?: string;

	type: "commit" | "stash";
};

export type GitRef = GitRefTag | GitRefBranch | GitRefHead | GitRefStash;

export type GitRefFullname =
	| GitRefTag["fullname"]
	| GitRefBranch["fullname"]
	| `ogg/categories/${string}`; // fake fullname for categories (such as "all local branches" or "all origin branches")

export type GitRefTag = {
	type: "tag";

	/** Unique identifier for the tag */
	fullname: `refs/tags/${string}`;
	name: string;

	/* Hash of the commit the tag is on */
	hash: string;
};
export type GitRefBranch = {
	type: "branch";

	/** Unique identifier for the branch */
	fullname: `refs/heads/${string}` | `refs/remotes/${string}`;
	name: string;
	remote?: string;

	/* Hash of the commit the branch is on */
	hash: string;
};
export type GitRefHead = {
	type: "head";

	/* Hash of the commit the head is on */
	hash: string;
};
export type GitRefStash = {
	type: "stash";

	/* Hash of the commit the stash is on */
	hash: string;
};

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

export const TAG_PREFIX = "refs/tags/";
export const BRANCH_PREFIX = "refs/heads/";
export const REMOTE_BRANCH_PREFIX = "refs/remotes/";

export const getPrefixedId = <T extends string>(
	prefix: T,
	value: string,
): `${T}${string}` => {
	if (!value.startsWith(prefix)) {
		throw new Error(`Invalid format ${value}, expected ${prefix}`);
	}

	if (value.endsWith("^{}")) {
		value = value.slice(0, -"^{}".length);
	}

	return value as `${T}${string}`;
};
