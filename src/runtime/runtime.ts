import * as vscode from "vscode";
import { FromRuntimeMessage, FromWebviewMessage } from "../types/messages.js";
import { GitCommands } from "./git/GitCommands.js";
import { execGit } from "./git/execGit.js";

export function activate(context: vscode.ExtensionContext) {
	const ch = vscode.window.createOutputChannel("Open git graph");

	ch.appendLine("Starting");

	let disposable = vscode.commands.registerCommand(
		"open-git-graph.helloWorld",
		() => {
			const panel = vscode.window.createWebviewPanel(
				"open-git-graph.view",
				"Open Git Graph",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
				},
			);

			const styleUri = panel.webview.asWebviewUri(
				vscode.Uri.joinPath(context.extensionUri, "dist", "output.css"),
			);
			const scriptUri = panel.webview.asWebviewUri(
				vscode.Uri.joinPath(context.extensionUri, "dist", "webview.js"),
			);

			let html = Buffer.from(webview, "base64").toString("utf-8");

			html = html.replace("${styleUri}", styleUri.toString());
			html = html.replace("${scriptUri}", scriptUri.toString());

			panel.webview.html = html;

			panel.webview.onDidReceiveMessage(async (e: FromWebviewMessage) => {
				switch (e.type) {
					case "INIT":
						const commands = new GitCommands();

						await Promise.allSettled([
							execGit(commands.getCommits()).then((r) => {
								sendMessage({
									type: "GET_COMMITS",
									commits: [...r],
								});
							}),
							execGit(commands.getRefs()).then((r) => {
								sendMessage({
									type: "GET_REFS",
									refs: [...r],
								});
							}),
						]);
						break;
				}
			});

			const sendMessage = (msg: FromRuntimeMessage) => {
				panel.webview.postMessage(msg);
			};
		},
	);
	ch.appendLine("Command registered");

	context.subscriptions.push(disposable);
}

const webview = `WEBVIEW_HTML`;

export function deactivate() {}
