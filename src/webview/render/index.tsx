import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { errorToString } from "../../universal/errorToString";
import { bridge } from "../bridge";
import { ErrorBoundary } from "./ErrorBoundary";
import { GraphTable } from "./components/GraphTable/index";
import { LoadingModal } from "./components/LoadingModal";
import { queryClient } from "./useBridge/useBridge";

export const render = () => {
	createRoot(document.querySelector("#root")!).render(
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>,
	);
};

const App = () => {
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
			<LoadingModal>
				<GraphTable />
			</LoadingModal>
		</ErrorBoundary>
	);
};
