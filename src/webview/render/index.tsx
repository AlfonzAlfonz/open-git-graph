import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useWebviewStore } from "../state/index.js";
import { GraphTable } from "./components/GraphTable/index.js";
import { Loading } from "./components/Loading.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { errorToString } from "../../universal/errorToString.js";

export const render = () => {
	createRoot(document.querySelector("#root")!).render(<App />);
};

const App = () => {
	const { graph, dispatch } = useWebviewStore();

	useEffect(() => {
		dispatch({ type: "INIT" });
	}, []);

	return (
		<ErrorBoundary
			handle={(e) => {
				console.error(e);
				dispatch({ type: "LOG_ERROR", content: errorToString(e) });
			}}
			fallback={
				<div className="w-[100vw] h-[100vh] flex items-center justify-center">
					<h1>Error happened :(</h1>
				</div>
			}
		>
			{graph?.data && <GraphTable />}

			{!graph?.data && (
				<div className="w-[100vw] h-[100vh] flex items-center justify-center">
					<Loading />
				</div>
			)}
		</ErrorBoundary>
	);
};
