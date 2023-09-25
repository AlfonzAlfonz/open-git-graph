import * as vscode from "vscode";
import { errors } from "../handleError";
import { RuntimeStore } from "../state/types";
import { Repository } from "../vscode.git/types";
import { createBridge } from "./createBridge";

export const createGraphPanel = async (
	context: vscode.ExtensionContext,
	store: RuntimeStore,
) => {
	const repo = await selectRepo(store.getState().repository);

	const panel = vscode.window.createWebviewPanel(
		"open-git-graph.graph",
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
	html = html.replace(
		"${scripts}",
		`
        <script>window.__REPOSITORY = "${repo.rootUri.toString()}"</script>
        <script src="${scriptUri.toString()}"></script>
      `,
	);

	panel.webview.html = html;

	createBridge(store, repo, panel.webview);

	return panel;
};

const webview = `WEBVIEW_HTML`; // Value is replaced at build time

export const selectRepo = async (repos: Record<string, Repository>) => {
	const keys = Object.keys(repos);

	if (keys.length === 0) {
		throw errors.noRepo();
	}

	if (keys.length === 1) {
		return repos[keys[0]!]!;
	}

	const selected = await vscode.window.showQuickPick(keys);

	return repos[selected ?? keys[0]!]!;
};
