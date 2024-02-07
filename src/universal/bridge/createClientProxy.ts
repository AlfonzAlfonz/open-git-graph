import { nanoid } from "nanoid";
import {
	BridgeParameters,
	BridgeRequest,
	BridgeResponse,
	BridgeReturnType,
} from "./types";

/**
 * return tuple of a Proxy object with the same interface as the bridge and
 * function used to handle responses from the other side of the bridge
 * @param postMessage function used to send out the requests
 * @returns
 */
export const createClientProxy = <TBridge extends object>(
	postMessage: (
		req: BridgeRequest<keyof TBridge, BridgeParameters<TBridge>>,
	) => unknown,
): [
	bridge: TBridge,
	responseHandler: (
		response: BridgeResponse<BridgeReturnType<TBridge>>,
	) => void,
] => {
	const listeners = new Map<string, Listener>();

	return [
		new Proxy<TBridge>({} as TBridge, {
			get: (_, key) => {
				if (typeof key !== "string") throw new Error("invalid method name");

				return {
					[key]: (...args: any[]) => {
						const id = createGuid();
						const method = key as keyof TBridge;

						postMessage({
							type: "request",
							id,
							method,
							args: args as any,
						});

						return new Promise((resolve, reject) => {
							listeners.set(id, [resolve, reject]);
						});
					},
				}[key];
			},
		}),
		(response) => {
			if (listeners.has(response.id)) {
				const [resolve, reject] = listeners.get(response.id)!;

				if (response.type === "response") resolve(response.result as never);
				if (response.type === "error") reject(response.error);
			} else {
				throw new Error(`Missing listener for id: ${response.id}`);
			}
		},
	];
};

type Listener = [resolve: (x: never) => void, reject: (e: unknown) => void];

const createGuid = () => nanoid();
