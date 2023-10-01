import * as vscode from "vscode";
import { catchErrors, errors } from "../handleError";
import { RuntimeStore } from "../state/types";
import { Repository } from "../vscode.git/types";
import { handleWebviewMessage } from "./handleWebviewMessage";
import { FromWebviewMessage } from "../../universal/messages";

export const createGraphPanel = async (
	context: vscode.ExtensionContext,
	store: RuntimeStore,
) => {
	const repoPath = await selectRepo(store.getState().repository);

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
        <script>window.__REPOSITORY = "${repoPath}"</script>
        <script src="${scriptUri.toString()}"></script>
      `,
	);

	panel.webview.html = html;

	panel.webview.onDidReceiveMessage(
		catchErrors(store, async (msg: FromWebviewMessage) => {
			await handleWebviewMessage(store, panel, msg);
		}),
	);

	store.dispatch({
		type: "ADD_PANEL",
		panel,
		state: { repoPath },
	});

	panel.onDidDispose(() =>
		store.dispatch({
			type: "REMOVE_PANEL",
			panel,
		}),
	);

	return panel;
};

const webview = `WEBVIEW_HTML`; // Value is replaced at build time

export const selectRepo = async (repos: Record<string, Repository>) => {
	const keys = Object.keys(repos);

	if (keys.length === 0) {
		throw errors.noRepo();
	}

	if (keys.length === 1) {
		return keys[0]!;
	}

	const selected = await vscode.window.showQuickPick(keys);

	return selected ?? keys[0]!;
};
