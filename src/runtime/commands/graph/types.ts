import { PanelState, RuntimeState } from "../../store/types";
import * as vscode from "vscode";

export type Handler<T> = (opts: HandlerOptions<T>) => Promise<void> | void;

export type HandlerOptions<T> = {
	msg: Omit<T, "type">;
	panel: vscode.WebviewPanel;
	state: RuntimeState;
	panelState: PanelState;
};
