import { GitCommit, GitRef } from "./git.js";
import { Req } from "./req.js";

export type FromWebviewMessage = InitMessage | ShowDiffMessage;

export type InitMessage = {
	type: "INIT";
};

export type ShowDiffMessage = {
	type: "SHOW_DIFF";
	a: [ref: string, path: string];
	b: [ref: string, path: string];
};

export type FromRuntimeMessage = GetCommitsMessage | GetRefsMessage;

export type GetCommitsMessage = {
	type: "APPEND_COMMITS";
	commits: Req<GitCommit[]>;
};

export type GetRefsMessage = {
	type: "GET_REFS";
	refs: Req<GitRef[]>;
};
