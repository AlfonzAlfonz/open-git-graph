import * as vscode from "vscode";
import { graphCommand } from "./commands/graph";
import { createBackend } from "./createBackend";
import { catchErrors } from "./handleError";
import { output, patchConsole } from "./logger";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider";
import { checkoutCommand } from "./commands/checkout";
import { resetHardCommand } from "./commands/resetHard";
import { resetSoftCommand } from "./commands/resetSoft";
import { resetMixedCommand } from "./commands/resetMixed";

let controller: AbortController;

export function activate(context: vscode.ExtensionContext) {
	patchConsole();

	console.info();
	console.info("Activating extension");
	console.info("=====================");

	controller = new AbortController();

	const backend = createBackend(context, controller.signal);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			ShowFileTextDocumentContentProvider.scheme,
			new ShowFileTextDocumentContentProvider(backend.repositoryManager),
		),
	);

	const commands = [
		graphCommand,
		checkoutCommand,
		resetHardCommand,
		resetSoftCommand,
		resetMixedCommand,
	];

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
