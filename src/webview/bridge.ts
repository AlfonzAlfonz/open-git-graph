import { WebToRuntimeBridge } from "../universal/protocol";
import { createClientProxy } from "../universal/protocol/utils";
import { vscodeApi } from "./vscodeApi";

export const [bridge, handleResponse] = createClientProxy<WebToRuntimeBridge>(
	vscodeApi.postMessage,
);
