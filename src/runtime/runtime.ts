import "core-js/proposals/async-iterator-helpers";

import * as vscode from "vscode";
import { graphCommand } from "./commands/graph";
import { createBackend } from "./createBackend";
import { ensureLogger } from "./logger";
import { catchErrors } from "./handleError";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider";

export function activate(context: vscode.ExtensionContext) {
	ensureLogger("activate").appendLine("Activating extension");

	const backend = createBackend(context);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			ShowFileTextDocumentContentProvider.scheme,
			new ShowFileTextDocumentContentProvider(backend.git),
		),
	);

	const commands = [graphCommand];

	for (const c of commands) {
		context.subscriptions.push(
			vscode.commands.registerCommand(c.id, catchErrors(c.command(backend))),
		);
	}
}

export function deactivate() {
	ensureLogger("").dispose();
}
