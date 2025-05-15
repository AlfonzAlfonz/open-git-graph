// @ts-nocheck
import * as vscode from "vscode";
import { graphCommand } from "./commands/graph";
import { createBackend } from "./createBackend";
import { ensureLogger } from "./logger";

export function activate(context: vscode.ExtensionContext) {
	ensureLogger().appendLine("Activating extension");

	const backend = createBackend(context);
	// const store = createStore();

	// context.subscriptions.push(
	// 	vscode.workspace.registerTextDocumentContentProvider(
	// 		ShowFileTextDocumentContentProvider.scheme,
	// 		new ShowFileTextDocumentContentProvider(store),
	// 	),
	// );

	// const commands = [graphCommand];

	// for (const c of commands) {
	// 	context.subscriptions.push(
	// 		vscode.commands.registerCommand(
	// 			c.id,
	// 			catchErrors(c.command(context, store)),
	// 		),
	// 	);
	// }

	context.subscriptions.push(
		vscode.commands.registerCommand("open-git-graph.graph", async () => {
			await graphCommand.command(backend);
		}),
	);
}

export function deactivate() {
	ensureLogger().dispose();
}
