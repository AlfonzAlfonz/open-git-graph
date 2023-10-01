export type Req<T> =
	| { state: "empty"; data: undefined; error: undefined }
	| { state: "waiting"; data: T | undefined; error: undefined }
	| { state: "done"; data: T; error: undefined }
	| { state: "error"; data: undefined; error: unknown };

export const req = {
	empty: <T>(): Req<T> => ({
		state: "empty",
		data: undefined,
		error: undefined,
	}),
	waiting: <T>(data?: T): Req<T> => ({
		state: "waiting",
		data,
		error: undefined,
	}),
	done: <T>(data: T): Req<T> => ({
		state: "done",
		data,
		error: undefined,
	}),
	error: <T>(error: unknown): Req<T> => ({
		state: "error",
		data: undefined,
		error,
	}),

	map: <T, U>(
		req: Req<T>,
		selector: (x: T) => U,
		onRejected: (e: unknown) => unknown,
	): Req<U> => {
		if (req.data) {
			try {
				const data = selector(req.data);
				return { state: req.state, data } as Req<U>;
			} catch (e) {
				onRejected(e);
				return { state: "error", data: undefined, error: e };
			}
		} else {
			return req as Req<U>;
		}
	},
};
