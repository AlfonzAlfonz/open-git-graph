export type Request<T> =
	| { state: "empty"; data: undefined; error: undefined }
	| { state: "waiting"; data: undefined; error: undefined }
	| { state: "done"; data: T; error: undefined }
	| { state: "error"; data: undefined; error: unknown };

export const req = {
	empty: <T>(): Request<T> => ({
		state: "empty",
		data: undefined,
		error: undefined,
	}),
	waiting: <T>(): Request<T> => ({
		state: "waiting",
		data: undefined,
		error: undefined,
	}),
	done: <T>(data: T): Request<T> => ({
		state: "done",
		data,
		error: undefined,
	}),
	error: <T>(error: unknown): Request<T> => ({
		state: "error",
		data: undefined,
		error,
	}),
};
