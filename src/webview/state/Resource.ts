export type Resource<T, TErr = unknown> =
	| { state: "ready"; value: T }
	| { state: "loading" }
	| { state: "error"; value: TErr };

export const Resource = {
	ready: <T>(value: T) => ({ state: "ready", value }) as const,
	loading: () => ({ state: "loading" }) as const,
	error: <TErr = unknown>(err: TErr) =>
		({ state: "error", value: err }) as const,
};
