import { isBridgeResponse } from "../universal/bridge";
import { isRuntimeMessage } from "../universal/message";
import { WebToRuntimeBridge } from "../universal/protocol/index";
import { handleResponse, messageQueue } from "./bridge";
import { render } from "./render/render";

window.addEventListener("message", (e) => {
	// handle responses from previous webToRuntime requests
	if (isBridgeResponse<WebToRuntimeBridge>(e.data)) {
		handleResponse(e.data);
	}

	if (isRuntimeMessage(e.data)) {
		messageQueue.dispatch(e.data);
	}
});

render();
