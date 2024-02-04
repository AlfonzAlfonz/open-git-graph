import {
	Dispatch,
	ReactNode,
	SetStateAction,
	createContext,
	useContext,
	useState,
} from "react";
import { Loading } from "./Loading";

export const LoadingModal = ({ children }: { children: ReactNode }) => {
	const state = useState(0);

	return (
		<LoadingContext.Provider value={state}>
			{children}
			<div className="fixed inset-0 pointer-events-none flex items-center justify-center">
				<div>{state[0] > 0 && <Loading />}</div>
			</div>
		</LoadingContext.Provider>
	);
};

export const useLoading = () => {
	const [state, setState] = useContext(LoadingContext);

	return [
		state > 0,
		(loading: boolean) => setState((s) => s + (loading ? 1 : -1)),
	] as const;
};

const LoadingContext = createContext<
	[number, Dispatch<SetStateAction<number>>]
>(null!);
