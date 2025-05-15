import { isBridgeResponse } from "../universal/bridge";
import { WebToRuntimeBridge } from "../universal/protocol/index";
import { handleResponse } from "./bridge";
import { render } from "./render/render";

window.addEventListener("message", (e) => {
	// handle responses from previous webToRuntime requests
	if (isBridgeResponse<WebToRuntimeBridge>(e.data)) {
		handleResponse(e.data);
	}

	// handle runtimeToWeb requests
	// if (isBridgeRequest<RuntimeToWebBridge>(e.data)) {
	// 	vscodeApi.postMessage(
	// 		createResponse(requestHandler, e.data, (e) => console.error(e)),
	// 	);
	// }
});

render();
