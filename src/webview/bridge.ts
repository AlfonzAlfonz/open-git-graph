import { Queue } from "@alfonz/async/Queue";
import { createClientProxy } from "../universal/bridge";
import { WebToRuntimeBridge } from "../universal/protocol";
import { vscodeApi } from "./vscodeApi";
import { RuntimeMessage } from "../universal/message";

export const messageQueue = Queue.create<RuntimeMessage>();

export const [bridge, handleResponse] = createClientProxy<WebToRuntimeBridge>(
	vscodeApi.postMessage,
);
