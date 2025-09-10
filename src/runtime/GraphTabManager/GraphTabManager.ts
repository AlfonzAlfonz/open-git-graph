import { fork } from "@alfonz/async/fork";
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
import { WebviewRequestHandler } from "./WebviewRequestHandler";

const debug = log("GraphTabManager");

export class GraphTabManager {
	private tabs: Map<string, [vscode.WebviewPanel, GraphTabState]> = new Map();

	constructor(
		private context: vscode.ExtensionContext,
		private appSignal: AbortSignal,
		private repositoryManager: RepositoryManager,
	) {}

	openOrFocus(repository: GitRepository) {
		if (this.tabs.has(repository.getPath())) {
			const panel = this.tabs.get(repository.getPath())![0];
			if (!panel.active) {
				panel.reveal();
			}
		} else {
			this.open(repository);
		}
	}

	open(repository: GitRepository) {
		debug("open", repository.getFsPath());

		const controller = new AbortController();
		const signal = AbortSignal.any([this.appSignal, controller.signal]);

		const panel = vscode.window.createWebviewPanel(
			"open-git-graph.graph",
			"Open Git Graph",
			{ viewColumn: vscode.ViewColumn.One, preserveFocus: true },
			{
				enableScripts: true,
				// TODO: remove this, both backend and frontend are able to start up very quickly, but vscode takes too long to long to load the webview
				retainContextWhenHidden: true,
			},
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

		panel.iconPath = vscode.Uri.joinPath(
			this.context.extensionUri,
			"assets",
			"logo-dark.svg",
		);

		panel.webview.html = renderHtmlShell({
			styleUri: styleUri.toString(),
			scriptUri: scriptUri.toString(),
		});

		this.tabs.set(repository.getPath(), [panel, state]);

		const handle = this.repositoryManager.getStateHandle(repository);

		fork([
			async () => {
				console.time("graph-data");
				await handle.getGraphData();
			},
			async () => {
				for await (const update of handle.state) {
					if (signal.aborted) break;

					console.timeEnd("graph-data");
					panel.webview.postMessage(runtimeMessage("graph", update));
				}
			},
		]);

		const handler = new WebviewRequestHandler(repository, handle, state);

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
			this.tabs.delete(repository.getPath());
		});

		return panel;
	}
}
