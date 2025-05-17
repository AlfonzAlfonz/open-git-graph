import "core-js/proposals/async-iterator-helpers";

import * as vscode from "vscode";
import { graphCommand } from "./commands/graph";
import { createBackend } from "./createBackend";
import { catchErrors } from "./handleError";
import { output } from "./logger";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider";

export function activate(context: vscode.ExtensionContext) {
	output.appendLine("Activating extension");

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
	output.dispose();
}
