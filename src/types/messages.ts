import { GitCommit, GitRef } from "./git";

export type FromWebviewMessage = InitMessage;

export type InitMessage = {
	type: "INIT";
};

export type FromRuntimeMessage = GetCommitsMessage | GetRefsMessage;

export type GetCommitsMessage = {
	type: "GET_COMMITS";
	commits: GitCommit[];
};

export type GetRefsMessage = {
	type: "GET_REFS";
	refs: GitRef[];
};
