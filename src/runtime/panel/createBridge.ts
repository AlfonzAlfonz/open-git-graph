import * as vscode from "vscode";
import { FromWebviewMessage } from "../../types/messages";
import { handleError } from "../handleError";
import { PanelState, RuntimeStore } from "../state/types";
import { handleInit } from "./handlers/handleInit";
import { Repository } from "../vscode.git/types";
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

	webview.onDidReceiveMessage(async (msg: FromWebviewMessage) => {
		store.getState().logger.appendLine(`Received from webview msg ${msg.type}`);
		try {
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
		} catch (e) {
			handleError(store.getState())(e);
		}
	});
};
