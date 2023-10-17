import * as vscode from "vscode";
import {
	RuntimeToWebBridge,
	WebToRuntimeBridge,
} from "../../universal/protocol/index.js";
import {
	createClientProxy,
	handleRequest,
	isBridgeRequest,
	isBridgeResponse,
} from "../../universal/protocol/utils.js";
import { errors } from "../handleError.js";
import { RuntimeStore } from "../state/types.js";
import { Repository } from "../vscode.git/types.js";
import { WebviewRequestHandler } from "./requestHandler.js";

export const createGraphPanel = async (
	context: vscode.ExtensionContext,
	store: RuntimeStore,
) => {
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
			panel.webview.postMessage(
				await handleRequest(new WebviewRequestHandler(store, panel), data),
			);
		}
	});

	store.dispatch({
		type: "ADD_PANEL",
		panel,
		state: {
			repoPath,
			expandedCommit: undefined,
			scroll: 0,
			bridge,
		},
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
