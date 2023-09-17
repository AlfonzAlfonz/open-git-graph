import { h, render as renderPreact } from "preact";
import { WebviewState } from "../state/index.js";
import { GraphRow } from "./components/GraphRow/index.js";

const graphDiv = document.querySelector("#graph tbody")!;

export const render = ({ graph, refs }: WebviewState) => {
	console.log("render", graph);
	renderPreact(
		graph?.nodes.map((node) =>
			h(GraphRow, {
				node,
				width: graph.width,
				tags: refs[node.commit.hash],
			}),
		),
		graphDiv,
	);
};
