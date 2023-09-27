import * as vscode from "vscode";
import { FromWebviewMessage } from "../../types/messages";
import { RuntimeStore } from "../state/types";
import { handleInit } from "./handlers/handleInit";
import { handleShowDiff } from "./handlers/handleShowDiff";
import { handleRefresh } from "./handlers/handleRefresh";
import { handleCheckout } from "./handlers/handleCheckout";

export const handleWebviewMessage = async (
	store: RuntimeStore,
	panel: vscode.WebviewPanel,
	msg: FromWebviewMessage,
) => {
	const state = store.getState();
	const panelState = state.panels.get(panel)!;
	state.logger.appendLine(`\nReceived from webview msg ${msg.type}`);

	switch (msg.type) {
		case "INIT":
			await handleInit({ msg, state, panelState, panel });
			break;
		case "SHOW_DIFF":
			await handleShowDiff({ msg, state, panelState, panel });
			break;
		case "REFRESH":
			await handleRefresh({ msg, state, panelState, panel });
			break;
		case "CHECKOUT":
			await handleCheckout({ msg, state, panelState, panel });
			break;
		default: {
			msg satisfies never;
		}
	}
};
