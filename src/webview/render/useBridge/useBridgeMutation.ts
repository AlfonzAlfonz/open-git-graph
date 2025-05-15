import { useLoading } from "../components/LoadingModal";

export const useBridgeMutation = <TArgs extends unknown[], TResult>(
	fetch: (...args: TArgs) => Promise<TResult>,
) => {
	const [loading, setLoading] = useLoading();

	const fire = async (...args: TArgs) => {
		setLoading(true);
		try {
			await fetch(...args);
		} finally {
			setLoading(false);
		}
	};

	return [fire, loading] as const;
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
