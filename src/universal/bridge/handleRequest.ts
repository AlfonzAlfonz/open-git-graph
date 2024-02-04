import {
	BridgeParameters,
	BridgeRequest,
	BridgeResponse,
	BridgeReturnType,
} from "./types";

/**
 * handles request from the other side of the bridge
 * @param requestHandler handler with the same interface as the bridge
 * @param request request from the other side of the bridge
 * @returns bridge response
 */
export const handleRequest = async <TBridge>(
	requestHandler: TBridge,
	request: BridgeRequest<keyof TBridge, BridgeParameters<TBridge>>,
	onReject: (e: unknown) => unknown,
): Promise<BridgeResponse<BridgeReturnType<TBridge>>> => {
	try {
		const result = await (requestHandler[request.method] as any)(
			...request.args,
		);

		return {
			type: "response",
			id: request.id,
			result,
		};
	} catch (error) {
		onReject(error);
		return {
			type: "error",
			id: request.id,
			error,
		};
	}
};
