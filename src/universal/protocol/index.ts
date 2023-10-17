import { GitCommit, GitIndex, GitRef } from "../git";

export interface WebToRuntimeBridge {
	getGraphData(): Promise<GraphData>;

	showDiff(path: string, a?: string, b?: string): Promise<void>;
	checkout(branch: string): Promise<void>;
	logError(content: string): Promise<void>;

	getState(): Promise<GraphState>;
	expandCommit: (value?: string) => Promise<void>;
	scroll: (value: number) => Promise<void>;
}

export type GraphData = {
	repoPath: string;
	index?: GitIndex;
	refs: GitRef[];
	commits: GitCommit[];
};

export type GraphState = {
	expandedCommit?: string;
	scroll: number;
};

export interface RuntimeToWebBridge {
	refresh(): Promise<void>;
}
