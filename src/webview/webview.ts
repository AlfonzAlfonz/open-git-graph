import {
	createResponse,
	isBridgeRequest,
	isBridgeResponse,
} from "../universal/bridge";
import {
	RuntimeToWebBridge,
	WebToRuntimeBridge,
} from "../universal/protocol/index";
import { handleResponse } from "./bridge";
import { render } from "./render/index";
import { requestHandler } from "./requestHandler";
import { vscodeApi } from "./vscodeApi";

window.addEventListener("message", (e) => {
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
});

render();
