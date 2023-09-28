import { render as renderPreact } from "preact";
import { useEffect } from "preact/hooks";
import { useWebviewStore } from "../state/index.js";
import { Loading } from "./components/Loading.js";
import { GraphTable } from "./components/GraphTable/index.js";

const graphDiv = document.querySelector("#root")!;

export const render = () => {
	renderPreact(<App />, graphDiv);
};

const App = () => {
	const { graph, dispatch } = useWebviewStore();

	useEffect(() => {
		dispatch({ type: "INIT" });
	}, []);

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
