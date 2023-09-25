import * as vscode from "vscode";
import { ShowFileTextDocumentContentProvider } from "./ShowFileTextDocumentContentProvider.js";
import { graphCommand } from "./commands/graph.js";
import { mergeHeadCommand } from "./commands/mergeMead.js";
import { rebaseHeadCommand } from "./commands/rebaseHead.js";
import { resetHeadCommand } from "./commands/resetHead.js";
import { catchErrors } from "./handleError.js";
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
	];

	for (const c of commands) {
		context.subscriptions.push(
			vscode.commands.registerCommand(
				c.id,
				catchErrors(store, c.command(context, store)),
			),
		);
	}
}

export function deactivate() {}
