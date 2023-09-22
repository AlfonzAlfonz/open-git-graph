import * as vscode from "vscode";
import { FromRuntimeMessage, FromWebviewMessage } from "../types/messages.js";
import { RuntimeState } from "./RuntimeState.js";
import { getGraphPanel } from "./getGraphPanel.js";

export function activate(context: vscode.ExtensionContext) {
	const ch = vscode.window.createOutputChannel("Open git graph");

	ch.appendLine("Starting");

	let disposable = vscode.commands.registerCommand(
		"open-git-graph.helloWorld",
		() => {
			const panel = getGraphPanel(context);

			const state = new RuntimeState((msg: FromRuntimeMessage) =>
				panel.webview.postMessage(msg),
			);

			panel.webview.onDidReceiveMessage(async (e: FromWebviewMessage) => {
				await state.receive(e);
			});
		},
	);
	ch.appendLine("Command registered");

	context.subscriptions.push(disposable);
}

export function deactivate() {}
