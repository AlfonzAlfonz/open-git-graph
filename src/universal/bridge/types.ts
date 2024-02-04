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

export type BridgeParameters<
	TBridge,
	TKey extends keyof TBridge = keyof TBridge,
> = TBridge[TKey] extends (...args: unknown[]) => unknown
	? Parameters<TBridge[TKey]>
	: never;

export type BridgeReturnType<
	TBridge,
	TKey extends keyof TBridge = keyof TBridge,
> = TBridge[TKey] extends (...args: unknown[]) => unknown
	? Awaited<ReturnType<TBridge[TKey]>>
	: never;
