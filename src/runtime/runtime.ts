import * as vscode from "vscode";
import { graphCommand } from "./commands/graph";
import { createBackend } from "./createBackend";
import { catchErrors } from "./handleError";
import { output, patchConsole } from "./logger";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider";

let controller: AbortController;

export function activate(context: vscode.ExtensionContext) {
	patchConsole();

	console.info("Activating extension");
	controller = new AbortController();

	const backend = createBackend(context, controller.signal);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			ShowFileTextDocumentContentProvider.scheme,
			new ShowFileTextDocumentContentProvider(backend.repositoryManager),
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
	controller.abort();
}
