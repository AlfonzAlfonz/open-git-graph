import { DependencyList, ReactNode, useEffect, useRef, useState } from "react";

type Result<T> =
	// pending
	| { data?: undefined; error?: undefined }
	// success
	| { data?: T; error?: undefined }
	// error
	| { data?: undefined; error?: unknown };

export const useResolve = <T>(
	fetcher: () => Promise<T>,
	deps: DependencyList,
) => {
	const [state, setState] = useState<Result<T>>({});
	const abortRef = useRef<AbortController>();

	const resolve = async () => {
		if (abortRef.current) {
			abortRef.current.abort();
		}
		abortRef.current = new AbortController();
		const currentSignal = abortRef.current.signal;
		return await fetcher()
			.then((data) => !currentSignal.aborted && setState({ data }))
			.catch((error) => !currentSignal.aborted && setState({ error }));
	};

	useEffect(() => {
		resolve();
	}, deps);

	return [state, resolve] as const;
};

export const renderState = <T>(
	result: Result<T>,
	{
		loading,
		data,
		error,
	}: {
		loading: () => ReactNode;
		data: (data: T) => ReactNode;
		error: (e: unknown) => ReactNode;
	},
) =>
	!result.data && !result.error
		? loading()
		: result.data
		? data(result.data)
		: error(result.error);
