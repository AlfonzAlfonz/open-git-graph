import {
	BridgeParameters,
	BridgeRequest,
	BridgeResponse,
	BridgeReturnType,
} from "./types";

export const isBridgeRequest = <TBridge>(
	x: unknown,
): x is BridgeRequest<keyof TBridge, BridgeParameters<TBridge>> =>
	!!x && typeof x === "object" && "type" in x && x.type === "request";

export const isBridgeResponse = <TBridge>(
	x: unknown,
): x is BridgeResponse<BridgeReturnType<TBridge>> =>
	!!x &&
	typeof x === "object" &&
	"type" in x &&
	(x.type === "response" || x.type === "error");
