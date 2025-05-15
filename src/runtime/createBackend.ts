import * as vscode from "vscode";
import { RepositoryManager } from "./RepositoryManager/RepositoryManager";
import { GraphTabManager } from "./GraphTabManager/GraphTabManager";

export type Backend = ReturnType<typeof createBackend>;

export const createBackend = (context: vscode.ExtensionContext) => {
	const git = new RepositoryManager();
	git.start();

	const graphTab = new GraphTabManager(context);

	return {
		git,
		graphTab,
	};
};
