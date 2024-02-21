import { Registry, asxnc } from "asxnc";

export interface DI<TServices> {
	service: <
		const TId extends keyof TServices & string,
		const T extends Exclude<keyof TServices & string, TId>[],
		TReturn,
	>(
		id: TId,
		services: T,
		init: (
			helpers: { register: (service: TServices[TId]) => Promise<void> },
			services: {
				[K in keyof T]: TServices[T[K]];
			} & Pick<TServices, T[number]>,
		) => Awaitable<TReturn>,
	) => Promise<void>;
	inject: <const T extends (keyof TServices & string)[], TReturn>(
		services: T,
		init: (
			services: {
				[K in keyof T]: TServices[T[K]];
			} & Pick<TServices, T[number]>,
		) => Awaitable<TReturn>,
	) => Promise<TReturn>;
	getSync: <TId extends keyof TServices & string>(id: TId) => TServices[TId];
	unsafe: Registry<DiEntries<TServices>>;
	active: Promise<void>;
	dispose: () => void;
	ready: Promise<void>;
}

export const di = <TServices>(init?: {
	[K in keyof TServices]: (ctx: DI<TServices>) => Promise<void>;
}): DI<TServices> => {
	const active = asxnc.lock();

	const registry = asxnc.registry<DiEntries<TServices>>();

	const dependencyGraph = new Map<string, string[]>();

	const initializedLock = asxnc.lock();

	const ctx: DI<TServices> = {
		service: async <
			const TId extends keyof TServices & string,
			const T extends Exclude<keyof TServices & string, TId>[],
			TReturn,
		>(
			id: TId,
			services: T,
			init: (
				helpers: { register: (service: TServices[TId]) => Promise<void> },
				services: {
					[K in keyof T]: TServices[T[K]];
				} & Pick<TServices, T[number]>,
			) => Awaitable<TReturn>,
		) => {
			if (dependencyGraph.has(id)) {
				throw new Error(
					`Service with id "${id}" is already registered or is being registered`,
				);
			} else {
				dependencyGraph.set(id, services);
				// TODO: detect cycles
			}
			const args = [];
			console.log(`starting ${id}`);
			for (const s of services) {
				args.push(await registry.waitFor(s));
			}

			await init(
				{
					register: (v) => {
						console.log("registering", id);
						registry.register(id, v);
						return active.handle;
					},
				},
				asxnc.labeledTuple(args, services) as any,
			);
		},
		inject: async <const T extends (keyof TServices & string)[], TReturn>(
			services: T,
			init: (
				services: {
					[K in keyof T]: TServices[T[K]];
				} & Pick<TServices, T[number]>,
			) => Awaitable<TReturn>,
		) => {
			const args = [];
			for (const s of services) {
				args.push(await registry.waitFor(s));
			}

			return await init(asxnc.labeledTuple(args, services) as any);
		},
		getSync: (id) => registry.getSync(id) as any,
		unsafe: registry,
		active: active.handle,
		dispose: active.release,
		ready: initializedLock.handle,
	};

	if (init) {
		Promise.all(
			Object.values<(ctx: DI<TServices>) => Promise<void>>(init).map((fn) =>
				fn(ctx),
			),
		).then(() => initializedLock.release());
	} else {
		initializedLock.release();
	}

	return ctx;
};

type Awaitable<T> = T | PromiseLike<T>;

type DiEntries<T> = {
	[K in keyof T]: [K & string, T[K]];
}[keyof T];
