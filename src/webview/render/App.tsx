import { ReactNode, useEffect } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { useAppContext } from "./contexts/AppContext";

export const App = ({ children }: { children: ReactNode }) => {
	const { expandedCommit, ...app } = useAppContext();

	useEffect(() => {
		const h = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (expandedCommit) {
					app.actions.expandCommit(undefined);
					return;
				}
			}
		};

		window.addEventListener("keydown", h);

		return () => {
			window.removeEventListener("keydown", h);
		};
	}, [app.actions, expandedCommit]);

	return (
		<ErrorBoundary
			handle={async (e, errorInfo) => {
				console.error(e, errorInfo);
				// await bridge.logError(errorToString(e));
				// await bridge.logError(errorToString(errorInfo));
			}}
			fallback={
				<div className="w-[100vw] h-[100vh] flex items-center justify-center">
					<h1>Error happened :(</h1>
				</div>
			}
		>
			{children}
		</ErrorBoundary>
	);
};
