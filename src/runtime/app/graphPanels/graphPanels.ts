import { AsxncEventTarget, asxnc } from "asxnc";
import * as vscode from "vscode";
import { errors } from "../../handleError";
import { Repository } from "../../store/vscode.git/types";
import { RuntimeCtx } from "../ctx";

type GraphPanelEvent = ["open", {}];

export type GraphPanelsService = {
	events: AsxncEventTarget<GraphPanelEvent>;
};

export const graphPanelsSaga =
	(context: vscode.ExtensionContext) => (ctx: RuntimeCtx) =>
		ctx.service("graphPanels", ["git"], async ({ register }, { git }) => {
			const events = asxnc.eventTarget(asxnc.pubsub<GraphPanelEvent>());

			await asxnc.race(register({ events }), async () => {
				for await (const e of events.eventTarget.event("open")) {
					const repo = await selectRepo(git.getRepositories());
					await createPanel(context.extensionUri, repo);
				}
			});
		});

const createPanel = async (extensionUri: vscode.Uri, repository: string) => {
	const panel = vscode.window.createWebviewPanel(
		"open-git-graph.graph",
		"Open Git Graph",
		vscode.ViewColumn.One,
		{ enableScripts: true },
	);
	const styleUri = panel.webview.asWebviewUri(
		vscode.Uri.joinPath(extensionUri, "dist", "output.css"),
	);
	const scriptUri = panel.webview.asWebviewUri(
		vscode.Uri.joinPath(extensionUri, "dist", "webview.js"),
	);

	let html = Buffer.from(webview, "base64").toString("utf-8");

	html = html.replace("${styleUri}", styleUri.toString());
	html = html.replace(
		"${scripts}",
		`<script src="${scriptUri.toString()}"></script>`,
	);

	panel.webview.html = html;

	// const [bridge, handleResponse] = createClientProxy<RuntimeToWebBridge>(
	// 	panel.webview.postMessage,
	// );

	// panel.webview.onDidReceiveMessage(async (data) => {
	// 	// handle responses from previous runtimeToWeb requests
	// 	if (isBridgeResponse<RuntimeToWebBridge>(data)) {
	// 		handleResponse(data);
	// 	}

	// 	// handle webToRuntime requests
	// 	if (isBridgeRequest<WebToRuntimeBridge>(data)) {
	// 		// ensureLogger().appendLine(
	// 		// 	`[run] Received request ${data.method} id: ${data.id}`,
	// 		// );
	// 		panel.webview.postMessage(
	// 			await createResponse(
	// 				new WebviewRequestHandler(store, panel),
	// 				data,
	// 				handleError,
	// 			),
	// 		);
	// 	}
	// });

	// store.addPanel(panel, repoPath, bridge)

	return panel;
};

const selectRepo = async (repos: Repository[]) => {
	if (repos.length === 0) {
		throw errors.noRepo();
	}

	if (repos.length === 1) {
		return repos[0]!.rootUri.toString();
	}

	const selected = await vscode.window.showQuickPick(
		repos.map((r) => r.rootUri.toString()),
	);

	return selected ?? repos[0]!.rootUri.toString();
};

declare const WEBVIEW_HTML: string;
const webview = WEBVIEW_HTML; // Value is replaced at build time
