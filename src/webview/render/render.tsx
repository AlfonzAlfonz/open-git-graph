import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./ErrorBoundary";
import { AppContext } from "./components/AppContext";
import { GraphTable } from "./components/GraphTable";
import { LoadingModal } from "./components/LoadingModal";
import { useApp } from "./useApp";

export const render = () => {
	createRoot(document.querySelector("#root")!).render(<App />);
};

const App = () => {
	const app = useApp();

	return (
		<AppContext.Provider value={app.state}>
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
				<LoadingModal>
					<GraphTable />
				</LoadingModal>
			</ErrorBoundary>
		</AppContext.Provider>
	);
};
