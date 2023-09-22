import { useDebugValue } from "preact/hooks";
import { useSyncExternalStore } from "preact/compat";
import type {
	Mutate,
	StateCreator,
	StoreApi,
	StoreMutatorIdentifier,
} from "zustand/vanilla";
import { createStore } from "zustand/vanilla";

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "subscribe">;

type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
	getServerState?: () => ExtractState<S>;
};

export function useStore<S extends WithReact<StoreApi<unknown>>>(
	api: S,
): ExtractState<S>;

export function useStore<S extends WithReact<StoreApi<unknown>>, U>(
	api: S,
	selector: (state: ExtractState<S>) => U,
): U;

export function useStore<TState, StateSlice>(api: WithReact<StoreApi<TState>>) {
	const slice = useSyncExternalStore(api.subscribe, api.getState);
	useDebugValue(slice);
	return slice;
}

export type UseBoundStore<S extends WithReact<ReadonlyStoreApi<unknown>>> = {
	(): ExtractState<S>;
	<U>(selector: (state: ExtractState<S>) => U): U;
} & S;

type Create = {
	<T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
		initializer: StateCreator<T, [], Mos>,
	): UseBoundStore<Mutate<StoreApi<T>, Mos>>;
	<T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
		initializer: StateCreator<T, [], Mos>,
	) => UseBoundStore<Mutate<StoreApi<T>, Mos>>;
};

const createImpl = <T>(createState: StateCreator<T, [], []>) => {
	const api =
		typeof createState === "function" ? createStore(createState) : createState;

	const useBoundStore: any = (selector?: any) => useStore(api, selector);

	Object.assign(useBoundStore, api);

	return useBoundStore;
};

export const create = (<T>(createState: StateCreator<T, [], []> | undefined) =>
	createState ? createImpl(createState) : createImpl) as Create;
