import { GitCommit, GitIndex, GitRef } from "../git";

export interface WebToRuntimeBridge {
	ready: (repoPath?: string) => Promise<GraphState>;

	pollGraphData(): Promise<void>;

	showDiff(path: string, a?: string, b?: string): Promise<void>;
	checkout(branch: string): Promise<void>;

	expandCommit(value?: string): Promise<void>;
	scroll(value: number): Promise<void>;
}

export type GraphData = {
	repoPath: string;
	index?: GitIndex;
	refs: GitRef[];
	commits: GitCommit[];
};

export type GraphState = {
	repoPath: string;
	expandedCommit?: string;
	scroll: number;
};

export interface RuntimeToWebBridge {
	refresh(): Promise<void>;
}
