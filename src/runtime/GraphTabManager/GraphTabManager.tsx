import { renderToStaticMarkup } from "react-dom/server";
import * as vscode from "vscode";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import {
	createClientProxy,
	createResponse,
	isBridgeRequest,
	isBridgeResponse,
} from "../../universal/bridge";
import {
	RuntimeToWebBridge,
	WebToRuntimeBridge,
} from "../../universal/protocol";
import { ensureLogger } from "../logger";
import { WebviewRequestHandler } from "./requestHandler";
import { handleError } from "../handleError";

export class GraphTabManager {
	constructor(private context: vscode.ExtensionContext) {}

	open(repository: GitRepository) {
		const panel = vscode.window.createWebviewPanel(
			"open-git-graph.graph",
			"Open Git Graph",
			vscode.ViewColumn.One,
			{ enableScripts: true },
		);
		const styleUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, "dist", "output.css"),
		);
		const scriptUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview.js"),
		);

		panel.webview.html = renderToStaticMarkup(
			<Shell styleUri={styleUri.toString()} scriptUri={scriptUri.toString()} />,
		);

		const [bridge, handleResponse] = createClientProxy<RuntimeToWebBridge>(
			panel.webview.postMessage,
		);

		panel.webview.onDidReceiveMessage(async (data) => {
			// handle responses from previous runtimeToWeb requests
			if (isBridgeResponse<RuntimeToWebBridge>(data)) {
				handleResponse(data);
			}

			// handle webToRuntime requests
			if (isBridgeRequest<WebToRuntimeBridge>(data)) {
				ensureLogger("GraphTabManager.onRequest").appendLine(
					`[run] Received request ${data.method} id: ${data.id}`,
				);
				panel.webview.postMessage(
					await createResponse(
						new WebviewRequestHandler(repository, panel),
						data,
						handleError,
					),
				);
			}
		});

		// store.addPanel(panel, repoPath, bridge);

		// panel.onDidDispose(() => store.removePanel(panel));

		return panel;
	}
}

const Shell = ({
	scriptUri,
	styleUri,
}: {
	scriptUri: string;
	styleUri: string;
}) => (
	<html lang="en">
		<head>
			<meta charSet="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Graph</title>
			<link href={styleUri} rel="stylesheet" />
		</head>

		<body>
			<div id="root"></div>
			<script src={scriptUri.toString()}></script>
		</body>
	</html>
);
