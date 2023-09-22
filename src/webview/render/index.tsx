import { render as renderPreact } from "preact";
import { useStore } from "../state/index.js";
import { GraphRow } from "./components/GraphRow/index.js";
import { Loading } from "./components/Loading.js";
import { useEffect } from "preact/hooks";

const graphDiv = document.querySelector("#root")!;

export const render = () => {
	renderPreact(<App />, graphDiv);
};

const App = () => {
	const { graph, tags, dispatch } = useStore();

	useEffect(() => {
		dispatch({ type: "INIT" });
	}, []);

	return (
		<>
			{graph?.data && (
				<table id="graph" class="w-full border-collapse">
					<thead>
						<tr>
							<th>Graph</th>
							<th>Info</th>
							<th>Author</th>
							<th>Commited</th>
							<th>Hash</th>
						</tr>
					</thead>
					<tbody>
						{graph.data.nodes.map((node) => (
							<GraphRow node={node} tags={tags.data?.[node.commit.hash]} />
						))}
					</tbody>
				</table>
			)}

			{graph?.state === "waiting" && (
				<div class="w-[100vw] h-[100vh] flex items-center justify-center">
					<Loading />
				</div>
			)}
		</>
	);
};
