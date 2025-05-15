import * as vscode from "vscode";
import {
	createClientProxy,
	createResponse,
	isBridgeRequest,
	isBridgeResponse,
} from "../../universal/bridge";
import {
	GraphState,
	RuntimeToWebBridge,
	WebToRuntimeBridge,
} from "../../universal/protocol";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { handleError } from "../handleError";
import { ensureLogger } from "../logger";
import { renderHtmlShell } from "./HtmlShell";
import { Graph, createGraphNodes } from "./createGraphNodes";
import { WebviewRequestHandler } from "./requestHandler";
import { collect, fork } from "asxnc";
import { GitIndex, GitRef } from "../../universal/git";

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

		fork([
			async () => {
				const data = await this.getGraphData(repository);

				state.index = data.index;
				state.refs = data.refs;
			},
		]);

		panel.webview.html = renderHtmlShell({
			styleUri: styleUri.toString(),
			scriptUri: scriptUri.toString(),
		});

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

	public async getGraphData(repository: GitRepository) {
		const dispatchRefs = async () => {
			return await collect(repository.getRefs());
		};

		const [refs, index] = await Promise.all([
			dispatchRefs(),
			repository.getIndex(),
		]);

		return {
			repoPath: repository.getPath(),
			index,
			commits: (await repository.getCommits()).commits,
			refs,
		};
	}
}
