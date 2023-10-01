import { render as renderPreact } from "preact";
import { useEffect, useErrorBoundary } from "preact/hooks";
import { useWebviewStore } from "../state/index.js";
import { Loading } from "./components/Loading.js";
import { GraphTable } from "./components/GraphTable/index.js";
import { errorToString } from "../../universal/errorToString.js";

const graphDiv = document.querySelector("#root")!;

export const render = () => {
	renderPreact(<App />, graphDiv);
};

const App = () => {
	const { graph, dispatch } = useWebviewStore();
	const [error, resetError] = useErrorBoundary(
		(e) => void dispatch({ type: "LOG_ERROR", content: errorToString(e) }),
	);

	useEffect(() => {
		dispatch({ type: "INIT" });
	}, []);

	if (error) {
		return (
			<div class="w-[100vw] h-[100vh] flex items-center justify-center">
				<h1>Error happened :(</h1>
				<button onClick={resetError}>Retry?</button>
			</div>
		);
	}

	return (
		<>
			{graph?.data && <GraphTable />}

			{!graph?.data && (
				<div class="w-[100vw] h-[100vh] flex items-center justify-center">
					<Loading />
				</div>
			)}
		</>
	);
};
