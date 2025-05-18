import * as vscode from "vscode";
import { RepositoryManager } from "./RepositoryManager/RepositoryManager";
import { GraphTabManager } from "./GraphTabManager/GraphTabManager";

export type Backend = ReturnType<typeof createBackend>;

export const createBackend = (
	context: vscode.ExtensionContext,
	appSignal: AbortSignal,
) => {
	const repositoryManager = new RepositoryManager(appSignal);
	repositoryManager.start();

	const graphTab = new GraphTabManager(context, appSignal, repositoryManager);

	return {
		repositoryManager,
		graphTab,
	};
};
