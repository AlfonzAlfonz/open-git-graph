import * as vscode from "vscode";
import { StoreApi } from "zustand/vanilla";
import { FromRuntimeMessage } from "../../types/messages.js";
import { GitExtension, Repository } from "../vscode.git/types.js";

export type Lazy<T> = { ensure: () => T };

export interface RuntimeState {
	extension: GitExtension;
	repository: Record<string, Repository>;
	logger: vscode.OutputChannel;
}

export interface PanelState extends RuntimeState {
	panelRepository: Repository;
	sendMessage: (msg: FromRuntimeMessage) => Thenable<boolean>;
}

export interface RuntimeStore extends Omit<StoreApi<RuntimeState>, "setState"> {
	dispatch: (msg: RuntimeAction) => void;
}

export type RuntimeAction = SetRepositoryAction | RemoveRepositoryAction;

export type SetRepositoryAction = {
	type: "SET_REPOSITORY";
	repository: Repository;
};

export type RemoveRepositoryAction = {
	type: "REMOVE_REPOSITORY";
	rootUri: string | vscode.Uri;
};

export type SetState = StoreApi<RuntimeState>["setState"];
