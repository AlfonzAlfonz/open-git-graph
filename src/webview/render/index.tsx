import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { errorToString } from "../../universal/errorToString.js";
import { bridge } from "../bridge.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { GraphTable } from "./components/GraphTable/index.js";
import { queryClient, useBridge } from "./useBridge/useBridge.js";

export const render = () => {
	createRoot(document.querySelector("#root")!).render(
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>,
	);
};

const App = () => {
	const { data } = useBridge(bridge.getState, []);

	return (
		<ErrorBoundary
			handle={async (e, errorInfo) => {
				console.error(e, errorInfo);
				await bridge.logError(errorToString(e));
				await bridge.logError(errorToString(errorInfo));
			}}
			fallback={
				<div className="w-[100vw] h-[100vh] flex items-center justify-center">
					<h1>Error happened :(</h1>
				</div>
			}
		>
			<GraphTable />
		</ErrorBoundary>
	);
};
