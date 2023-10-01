import { GitCommit, GitIndex, GitRef } from "./git.js";
import { Req } from "./req.js";

export type FromWebviewMessage =
	| InitMessage
	| RefreshMessage
	| ShowDiffMessage
	| CheckoutMessage
	| LogErrorMessage;

export type InitMessage = {
	type: "INIT";
};

export type RefreshMessage = {
	type: "REFRESH";
};

export type ShowDiffMessage = {
	type: "SHOW_DIFF";
	a?: string;
	b?: string;
	path: string;
};

export type CheckoutMessage = {
	type: "CHECKOUT";
	branch: string;
};

export type LogErrorMessage = {
	type: "LOG_ERROR";
	content: string;
};

export type FromRuntimeMessage =
	| SetCommitsMessage
	| AppendCommitsMessage
	| SetRefsMessage
	| SetStashesMessage;

export type SetCommitsMessage = {
	type: "SET_COMMITS";
	commits: Req<{
		index: GitIndex;
		commits: GitCommit[];
	}>;
};

export type AppendCommitsMessage = {
	type: "APPEND_COMMITS";
	commits: Req<GitCommit[]>;
};

export type SetRefsMessage = {
	type: "SET_REFS";
	refs: Req<GitRef[]>;
};

export type SetStashesMessage = {
	type: "SET_STASHES";
	stashes: Req<GitRef[]>;
};
