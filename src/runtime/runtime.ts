import * as vscode from "vscode";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider.js";
import { checkoutCommand } from "./commands/checkout.js";
import { graphCommand } from "./commands/graph/graph.js";
import { mergeHeadCommand } from "./commands/mergeMead.js";
import { rebaseHeadCommand } from "./commands/rebaseHead.js";
import { resetHeadCommand } from "./commands/resetHead.js";
import { catchErrors } from "./handleError.js";
import { lazyRuntimeStore } from "./store/index.js";
import { ensureLogger } from "./logger.js";

export function activate(context: vscode.ExtensionContext) {
	ensureLogger().appendLine("Activating extension");

	const store = lazyRuntimeStore();

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			ShowFileTextDocumentContentProvider.scheme,
			new ShowFileTextDocumentContentProvider(store),
		),
	);

	const commands = [
		graphCommand,
		mergeHeadCommand,
		rebaseHeadCommand,
		resetHeadCommand,
		checkoutCommand,
	];

	for (const c of commands) {
		context.subscriptions.push(
			vscode.commands.registerCommand(
				c.id,
				catchErrors(c.command(context, store)),
			),
		);
	}
}

export function deactivate() {
	ensureLogger().dispose();
}
