import { createClientProxy } from "../universal/bridge";
import { WebToRuntimeBridge } from "../universal/protocol";
import { vscodeApi } from "./vscodeApi";

export const [bridge, handleResponse] = createClientProxy<WebToRuntimeBridge>(
	vscodeApi.postMessage,
);
