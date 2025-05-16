import { Mutex } from "asxnc/Mutex";
import * as vscode from "vscode";
import { createResponse, isBridgeRequest } from "../../universal/bridge";
import { GitCommit, GitIndex, GitRef } from "../../universal/git";
import { GraphState, WebToRuntimeBridge } from "../../universal/protocol";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { handleError } from "../handleError";
import { log } from "../logger";
import { renderHtmlShell } from "./HtmlShell";
import { Graph } from "./createGraphNodes";
import { WebviewRequestHandler } from "./requestHandler";

export interface GraphTabState extends GraphState {
	index?: GitIndex;
	refs?: GitRef[];

	graphIterator: Mutex<{
		iterator: AsyncIterator<Graph, void, Iterable<GitCommit>> | undefined;
	}>;
}

const debug = log("GraphTabManager");

export class GraphTabManager {
	constructor(private context: vscode.ExtensionContext) {}

	open(repository: GitRepository) {
		const key = repository.getPath();

		const panel = vscode.window.createWebviewPanel(
			"open-git-graph.graph",
			"Open Git Graph",
			vscode.ViewColumn.One,
			{ enableScripts: true, retainContextWhenHidden: true },
		);
		const styleUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, "dist", "output.css"),
		);
		const scriptUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview.js"),
		);

		const state: GraphTabState = {
			repoPath: repository.getPath(),
			expandedCommit: undefined,
			scroll: 0,
			graphIterator: Mutex.create({ iterator: undefined }),
		};

		panel.webview.html = renderHtmlShell({
			styleUri: styleUri.toString(),
			scriptUri: scriptUri.toString(),
		});

		const handler = new WebviewRequestHandler(
			repository,
			() => state,
			(x) => panel.webview.postMessage(x),
		);

		panel.webview.onDidReceiveMessage(async (data) => {
			// handle webToRuntime requests
			if (isBridgeRequest<WebToRuntimeBridge>(data)) {
				debug("onRequest", data.id, data.args);
				panel.webview.postMessage(
					await createResponse(handler, data, handleError),
				);
			}
		});

		const changeDisposable = repository.onDidChange(() => {
			// handler.getGraphData(true);
		});

		// store.addPanel(panel, repoPath, bridge);

		panel.onDidDispose(() => {
			changeDisposable.dispose();
		});

		return panel;
	}
}
