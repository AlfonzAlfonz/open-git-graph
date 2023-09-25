import * as vscode from "vscode";
import { FromWebviewMessage } from "../../types/messages";
import { catchErrors } from "../handleError";
import { PanelState, RuntimeStore } from "../state/types";
import { Repository } from "../vscode.git/types";
import { handleInit } from "./handlers/handleInit";
import { handleShowDiff } from "./handlers/handleShowDiff";

export const createBridge = (
	store: RuntimeStore,
	repository: Repository,
	webview: vscode.Webview,
) => {
	const getState = <T>(cb: (state: PanelState) => T) =>
		cb({
			...store.getState(),
			panelRepository: repository,
			sendMessage: async (msg) => await webview.postMessage(msg),
		});

	webview.onDidReceiveMessage(
		catchErrors(store, async (msg: FromWebviewMessage) => {
			store
				.getState()
				.logger.appendLine(`\nReceived from webview msg ${msg.type}`);

			switch (msg.type) {
				case "INIT":
					await handleInit(msg, getState);
					break;
				case "SHOW_DIFF":
					await handleShowDiff(msg, getState);
					break;
				default: {
					msg satisfies never;
				}
			}
		}),
	);
};
