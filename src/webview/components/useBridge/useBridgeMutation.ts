import { useMutation } from "@tanstack/react-query";
import { useLoading } from "../LoadingModal";

export const useBridgeMutation = <TArgs extends unknown[], TResult>(
	fetch: (...args: TArgs) => Promise<TResult>,
) => {
	const [, setLoading] = useLoading();

	const query = useMutation({
		mutationKey: [fetch.name],
		mutationFn: wrapFetch(fetch, setLoading),
		networkMode: "always",
	});

	return query;
};

export const wrapFetch =
	<TArgs extends any[], TResult>(
		fetch: (...args: TArgs) => Promise<TResult>,
		setLoading: (loading: boolean) => void,
	) =>
	async (args: TArgs) => {
		setLoading(true);
		try {
			return await fetch(...args);
		} finally {
			setLoading(false);
		}
	};
