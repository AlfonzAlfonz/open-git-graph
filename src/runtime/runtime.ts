import * as vscode from "vscode";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider";
import { checkoutCommand } from "./commands/checkout";
import { graphCommand } from "./commands/graph/graph";
import { mergeHeadCommand } from "./commands/mergeMead";
import { rebaseHeadCommand } from "./commands/rebaseHead";
import { resetHeadCommand } from "./commands/resetHead";
import { catchErrors } from "./handleError";
import { lazyRuntimeStore } from "./store/index";
import { ensureLogger } from "./logger";

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
