import {
	RuntimeToWebBridge,
	WebToRuntimeBridge,
} from "../universal/protocol/index.js";
import {
	handleRequest,
	isBridgeRequest,
	isBridgeResponse,
} from "../universal/protocol/utils.js";
import { handleResponse } from "./bridge.js";
import { render } from "./render/index.js";
import { requestHandler } from "./requestHandler.js";
import { vscodeApi } from "./vscodeApi.js";

window.addEventListener("message", (e) => {
	// handle responses from previous webToRuntime requests
	if (isBridgeResponse<WebToRuntimeBridge>(e.data)) {
		handleResponse(e.data);
	}

	// handle runtimeToWeb requests
	if (isBridgeRequest<RuntimeToWebBridge>(e.data)) {
		vscodeApi.postMessage(
			handleRequest(requestHandler, e.data, (e) => console.error(e)),
		);
	}
});

render();
