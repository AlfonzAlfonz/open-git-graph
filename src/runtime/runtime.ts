import * as vscode from "vscode";
import { graphCommand } from "./commands/graph";
import { createBackend } from "./createBackend";
import { catchErrors, handleError } from "./handleError";
import { output, patchConsole } from "./logger";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider";
import { checkoutCommand } from "./commands/checkout";
import { resetCommand } from "./commands/reset";

import { deleteBranchCommand } from "./commands/deleteBranch";
import { deleteRemoteBranchCommand } from "./commands/deleteRemoteBranch";
import { cherryPickCommand } from "./commands/cherryPick";
import { rebaseCommand } from "./commands/rebase";
import { mergeCommand } from "./commands/merge";
import { tagCommand } from "./commands/tag";
import { stashApplyCommand } from "./commands/stashApply";
import { stashPopCommand } from "./commands/stashPop";
import { stashDropCommand } from "./commands/stashDrop";
import { openSearchCommand } from "./commands/openSearch";

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
		openSearchCommand,
		checkoutCommand,
		resetCommand,
		deleteBranchCommand,
		deleteRemoteBranchCommand,
		cherryPickCommand,
		rebaseCommand,
		mergeCommand,
		tagCommand,
		stashApplyCommand,
		stashPopCommand,
		stashDropCommand,
	];

	for (const c of commands) {
		context.subscriptions.push(
			vscode.commands.registerCommand(
				c.id,
				catchErrors(c.command(backend), handleError(true)),
			),
		);
	}
}

export function deactivate() {
	output.dispose();
	controller.abort();
}
