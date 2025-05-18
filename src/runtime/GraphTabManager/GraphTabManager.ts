import { fork } from "asxnc";
import * as vscode from "vscode";
import { createResponse, isBridgeRequest } from "../../universal/bridge";
import { runtimeMessage } from "../../universal/message";
import { GraphTabState, WebToRuntimeBridge } from "../../universal/protocol";
import { RepositoryManager } from "../RepositoryManager/RepositoryManager";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { handleError } from "../handleError";
import { log } from "../logger";
import { signalDisposable } from "../utils";
import { renderHtmlShell } from "./HtmlShell";
import { WebviewRequestHandler } from "./requestHandler";

const debug = log("GraphTabManager");

export class GraphTabManager {
	constructor(
		private context: vscode.ExtensionContext,
		private appSignal: AbortSignal,
		private repositoryManager: RepositoryManager,
	) {}

	open(repository: GitRepository) {
		debug("open", repository.getFsPath());

		const controller = new AbortController();
		const signal = AbortSignal.any([this.appSignal, controller.signal]);

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
			repoPath: repository.getPath(),
			expandedCommit: undefined,
			scroll: 0,
		};

		panel.webview.html = renderHtmlShell({
			styleUri: styleUri.toString(),
			scriptUri: scriptUri.toString(),
		});

		const handle = this.repositoryManager.getStateHandle(repository);

		fork(async () => {
			for await (const update of handle.state) {
				if (signal.aborted) break;

				panel.webview.postMessage(runtimeMessage("graph", update));
			}
		});

		const handler = new WebviewRequestHandler(
			this.repositoryManager.getStateHandle(repository),
			state,
			(x) => panel.webview.postMessage(x),
		);

		signalDisposable(
			signal,
			panel.webview.onDidReceiveMessage(async (data) => {
				// handle webToRuntime requests
				if (isBridgeRequest<WebToRuntimeBridge>(data)) {
					debug("onRequest", data.id, data.args);
					panel.webview.postMessage(
						await createResponse(handler, data, handleError),
					);
				}
			}),
		);

		panel.onDidDispose(() => {
			controller.abort();
		});

		return panel;
	}
}
