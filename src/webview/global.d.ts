import { FromWebviewMessage } from "../types/messages";
import { WebviewState } from "./state";

declare global {
	function acquireVsCodeApi(): {
		getState: () => WebviewState | null;
		postMessage: (message: FromWebviewMessage) => void;
		setState: (state: WebviewState) => void;
	};
}
