import * as vscode from "vscode";

export const getGraphPanel = (context: vscode.ExtensionContext) => {
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

	return panel;
};

const webview = `WEBVIEW_HTML`;
