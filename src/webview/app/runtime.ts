import {
	createClientProxy,
	createResponse,
	isBridgeRequest,
	isBridgeResponse,
} from "../../universal/bridge";
import {
	RuntimeToWebBridge,
	WebToRuntimeBridge,
} from "../../universal/protocol";
import { vscodeApi } from "../vscodeApi";
import { WebviewCtx } from "./ctx";

export type RuntimeService = WebToRuntimeBridge;

export const runtimeService = (ctx: WebviewCtx) =>
	ctx.service("runtime", [], async ({ register }) => {
		const [bridge, handleResponse] = createClientProxy<WebToRuntimeBridge>(
			vscodeApi.postMessage,
		);

		const requestHandler: RuntimeToWebBridge = {
			async refresh() {},
		};

		const handler = (e: MessageEvent) => {
			// handle responses from previous webToRuntime requests
			if (isBridgeResponse<WebToRuntimeBridge>(e.data)) {
				handleResponse(e.data);
			}

			// handle runtimeToWeb requests
			if (isBridgeRequest<RuntimeToWebBridge>(e.data)) {
				vscodeApi.postMessage(
					createResponse(requestHandler, e.data, (e) => console.error(e)),
				);
			}
		};

		window.addEventListener("message", handler);

		await register(bridge);

		window.removeEventListener("message", handler);
	});
