import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryCache, QueryClient, useQuery } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { vscodeStorage } from "../../vscodeApi";
import { useLoading } from "../components/LoadingModal";
import { bridge } from "../../bridge";
import { errorToString } from "../../../universal/errorToString";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 10000,
			gcTime: 10000,
		},
	},
	queryCache: new QueryCache({
		onError: (e) => {
			bridge.logError(errorToString(e));
		},
	}),
});

const localStoragePersister = createSyncStoragePersister({
	storage: vscodeStorage,
});

persistQueryClient({
	queryClient,
	persister: localStoragePersister,
});

export const useBridge = <TArgs extends unknown[], TResult>(
	fetch: (...args: TArgs) => Promise<TResult>,
	args: TArgs,
) => {
	const [, setLoading] = useLoading();

	const query = useQuery({
		queryKey: [fetch.name, ...args] as [string, ...TArgs],
		queryFn: wrapFetch(fetch, setLoading),
		networkMode: "always",
		refetchOnWindowFocus: false,
	});

	return query;
};

export const invalidate = <TArgs extends unknown[], TResult>(
	fetch: (...args: TArgs) => Promise<TResult>,
	args: TArgs,
) => {
	return queryClient.invalidateQueries({ queryKey: [fetch.name, ...args] });
};

export const wrapFetch =
	<TArgs extends any[], TResult>(
		fetch: (...args: TArgs) => Promise<TResult>,
		setLoading: (loading: boolean) => void,
	) =>
	async ({ queryKey: [, ...args] }: { queryKey: [string, ...TArgs] }) => {
		setLoading(true);
		try {
			return await fetch(...args);
		} finally {
			setLoading(false);
		}
	};
