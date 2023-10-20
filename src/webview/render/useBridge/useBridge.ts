import { QueryClient, useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useRef } from "react";

export const queryClient = new QueryClient();

export const useBridge = <TArgs extends unknown[], TResult>(
	fetch: (...args: TArgs) => Promise<TResult>,
	args: TArgs,
) => {
	const fetchRef = useRef<
		(x: { queryKey: [key: string, ...args: TArgs] }) => Promise<TResult>
	>(({ queryKey: [, ...args] }) => fetch(...args));
	useLayoutEffect(() => {
		fetchRef.current = ({ queryKey: [, ...args] }) => fetch(...args);
	});
	return useQuery({
		queryKey: [fetch.name, ...args] as [string, ...TArgs],
		queryFn: fetchRef.current,
		networkMode: "always",
		refetchOnWindowFocus: false,
	});
};

export const invalidate = <TArgs extends unknown[], TResult>(
	fetch: (...args: TArgs) => Promise<TResult>,
	args: TArgs,
) => {
	return queryClient.invalidateQueries({ queryKey: [fetch.name, ...args] });
};
