import * as vscode from "vscode";
import { createResponse, isBridgeRequest } from "../../universal/bridge";
import { GitIndex, GitRef } from "../../universal/git";
import { GraphState, WebToRuntimeBridge } from "../../universal/protocol";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { handleError } from "../handleError";
import { ensureLogger } from "../logger";
import { renderHtmlShell } from "./HtmlShell";
import { Graph, createGraphNodes } from "./createGraphNodes";
import { WebviewRequestHandler } from "./requestHandler";

interface GraphTabState extends GraphState {
	index?: GitIndex;
	refs?: GitRef[];

	graph: Graph;
}

export class GraphTabManager {
	private state: Record<string, {}> = {};

	constructor(private context: vscode.ExtensionContext) {}

	open(repository: GitRepository) {
		const key = repository.getPath();

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

		const state: GraphTabState = {
			graph: createGraphNodes([], undefined, undefined),
			expandedCommit: undefined,
			scroll: 0,
		};

		panel.webview.html = renderHtmlShell({
			styleUri: styleUri.toString(),
			scriptUri: scriptUri.toString(),
		});

		panel.webview.onDidReceiveMessage(async (data) => {
			// handle webToRuntime requests
			if (isBridgeRequest<WebToRuntimeBridge>(data)) {
				ensureLogger("GraphTabManager.onRequest").appendLine(
					`[run] Received request ${data.id}`,
				);
				panel.webview.postMessage(
					await createResponse(
						new WebviewRequestHandler(
							this,
							repository,
							() => state,
							panel,
							(x) => panel.webview.postMessage(x),
						),
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
