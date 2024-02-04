import * as vscode from "vscode";
import {
	createClientProxy,
	handleRequest,
	isBridgeRequest,
	isBridgeResponse,
} from "../../../universal/bridge";
import {
	RuntimeToWebBridge,
	WebToRuntimeBridge,
} from "../../../universal/protocol";
import { errors, handleError } from "../../handleError";
import { ensureLogger } from "../../logger";
import { Repository } from "../../store/vscode.git/types";
import { command } from "../../utils";
import { WebviewRequestHandler } from "./requestHandler";

export const graphCommand = command({
	id: "open-git-graph.graph",
	command: (context, s) => async () => {
		const store = s.ensure();
		const repoPath = await selectRepo(store.getState().repository);

		const panel = vscode.window.createWebviewPanel(
			"open-git-graph.graph",
			"Open Git Graph",
			vscode.ViewColumn.One,
			{ enableScripts: true },
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
			`<script src="${scriptUri.toString()}"></script>`,
		);

		panel.webview.html = html;

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
				ensureLogger().appendLine(
					`[run] Received request ${data.method} id: ${data.id}`,
				);
				panel.webview.postMessage(
					await handleRequest(
						new WebviewRequestHandler(store, panel),
						data,
						handleError,
					),
				);
			}
		});

		store.addPanel(panel, repoPath, bridge);

		panel.onDidDispose(() => store.removePanel(panel));

		return panel;
	},
});

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
