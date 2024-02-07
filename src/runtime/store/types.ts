import * as vscode from "vscode";
import { GitExtension, Repository } from "./vscode.git/types";
import { RuntimeToWebBridge } from "../../universal/protocol/index";

export type Lazy<T> = { ensure: () => T };

export interface RuntimeState {
	extension: GitExtension;
	repository: Record<string, Repository>;

	panels: Map<vscode.WebviewPanel, PanelState>;
}

export interface PanelState {
	repoPath: string;

	expandedCommit: string | undefined;
	scroll: number;

	bridge: RuntimeToWebBridge;
}
