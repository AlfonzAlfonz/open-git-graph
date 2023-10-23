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

export type BridgeRequest<Tkey, T extends any[]> = {
	type: "request";
	id: string;
	method: Tkey;
	args: T;
};

export type BridgeResponse<T> =
	| { type: "response"; id: string; result: T }
	| {
			type: "error";
			id: string;
			error: unknown;
	  };

type Listener = [resolve: (x: never) => void, reject: (e: unknown) => void];

type BridgeParameters<
	TBridge,
	TKey extends keyof TBridge = keyof TBridge,
> = TBridge[TKey] extends (...args: unknown[]) => unknown
	? Parameters<TBridge[TKey]>
	: never;

type BridgeReturnType<
	TBridge,
	TKey extends keyof TBridge = keyof TBridge,
> = TBridge[TKey] extends (...args: unknown[]) => unknown
	? Awaited<ReturnType<TBridge[TKey]>>
	: never;

const createGuid = () => (Math.random() * 100_000).toFixed(0);
