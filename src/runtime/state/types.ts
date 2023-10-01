import * as vscode from "vscode";
import { StoreApi } from "zustand/vanilla";
import { GitExtension, Repository } from "../vscode.git/types.js";

export type Lazy<T> = { ensure: () => T };

export interface RuntimeState {
	extension: GitExtension;
	repository: Record<string, Repository>;
	logger: vscode.OutputChannel;

	panels: Map<vscode.WebviewPanel, PanelState>;
}

export interface PanelState {
	repoPath: string;
}

export interface RuntimeStore extends Omit<StoreApi<RuntimeState>, "setState"> {
	dispatch: (msg: RuntimeAction) => void;
}

export type RuntimeAction =
	| SetRepositoryAction
	| RemoveRepositoryAction
	| AddPanel
	| RemovePanel;

export type SetRepositoryAction = {
	type: "SET_REPOSITORY";
	repository: Repository;
};

export type RemoveRepositoryAction = {
	type: "REMOVE_REPOSITORY";
	rootUri: string | vscode.Uri;
};

export type AddPanel = {
	type: "ADD_PANEL";
	panel: vscode.WebviewPanel;
	state: PanelState;
};

export type RemovePanel = {
	type: "REMOVE_PANEL";
	panel: vscode.WebviewPanel;
};

export type SetState = StoreApi<RuntimeState>["setState"];
