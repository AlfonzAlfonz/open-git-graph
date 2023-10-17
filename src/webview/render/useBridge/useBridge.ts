import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useRef } from "react";

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
	});
};
