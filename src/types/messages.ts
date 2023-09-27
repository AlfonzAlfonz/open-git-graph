import { GitCommit, GitRef } from "./git.js";
import { Req } from "./req.js";

export type FromWebviewMessage =
	| InitMessage
	| RefreshMessage
	| ShowDiffMessage
	| CheckoutMessage;

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

export type FromRuntimeMessage =
	| SetCommitsMessage
	| AppendCommitsMessage
	| GetRefsMessage;

export type SetCommitsMessage = {
	type: "SET_COMMITS";
	commits: Req<GitCommit[]>;
};

export type AppendCommitsMessage = {
	type: "APPEND_COMMITS";
	commits: Req<GitCommit[]>;
};

export type GetRefsMessage = {
	type: "GET_REFS";
	refs: Req<GitRef[]>;
};
