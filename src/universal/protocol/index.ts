import { GitCommit, GitIndex, GitRef, GitRefBranch, GitRefTag } from "../git";

export interface WebToRuntimeBridge {
	ready: (repoPath?: string) => Promise<GraphTabState>;
	reload: () => Promise<void>;
	fetch: () => Promise<void>;

	pollGraphData(): Promise<{ done: boolean }>;

	getCommit: (hash: string) => Promise<GitCommit>;

	showDiff: (path: string, a?: string, b?: string) => Promise<void>;
	checkout: (branch: string) => Promise<void>;

	expandCommit: (value?: string) => Promise<void>;
	scroll: (value: number) => Promise<void>;
	setRefs: (refs: (GitRefBranch | GitRefTag)[]) => Promise<void>;

	search: (pattern: string) => Promise<string[]>;
}

export type GraphData = {
	repoPath: string;
	currentBranch: string;
	index?: GitIndex;
	refs: GitRef[];
	commits: GitCommit[];
};

export type GraphTabState = {
	repoPath: string;
	expandedCommit?: string;
	scroll: number;

	activeRefCommits: Set<string>;
};

export interface RuntimeToWebBridge {
	refresh(): Promise<void>;
}
