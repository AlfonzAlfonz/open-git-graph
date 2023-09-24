import * as vscode from "vscode";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider.js";
import { createGraphPanel } from "./panel/index.js";
import { runtimeStore } from "./state/index.js";
import { ensureGitExtension } from "./vscode.git/index.js";

export function activate(context: vscode.ExtensionContext) {
	const logger = vscode.window.createOutputChannel("Open git graph");

	const git = ensureGitExtension();

	const store = runtimeStore({
		extension: git.exports,
		repository: {},
		logger,
	});

	vscode.workspace.registerTextDocumentContentProvider(
		ShowFileTextDocumentContentProvider.scheme,
		new ShowFileTextDocumentContentProvider(store),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("open-git-graph.helloWorld", () => {
			createGraphPanel(context, store.ensure());
		}),
	);
}

export function deactivate() {}
