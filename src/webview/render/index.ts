import { WebviewState } from "../state/index.js";
import { renderNode } from "./renderNode.js";
import { renderRefs } from "./renderTags.js";
import { createEl, getColor } from "./utils.js";

const graphDiv = document.querySelector("#graph tbody")!;

export const render = ({ graph, refs }: WebviewState) => {
	graphDiv.textContent = "";

	if (graph?.nodes) {
		for (const n of graph.nodes) {
			const commitRefs = refs[n.commit.hash];
			const isHead = commitRefs?.some((r) => r.type === "head");
			const row = createEl("tr");

			if (n.commit.parents.length > 1) row.classList.add("merge");
			if (isHead) row.classList.add("head");

			row.appendChild(createEl("td", {}, [renderNode(n, graph.width)]));

			const subj: (string | Node)[] = [];

			row.appendChild(
				createEl(
					"td",
					{ class: getColor(n.position) },
					createEl("div", { class: "flex items-center gap-1 swag" }, [
						...renderRefs(refs[n.commit.hash] ?? []),
						n.commit.subject,
					]),
				),
			);
			row.appendChild(createEl("td", {}, [n.commit.author]));
			row.appendChild(createEl("td", {}, [n.commit.authorDate]));
			row.appendChild(createEl("td", {}, [n.commit.hash.slice(0, 10)]));

			graphDiv.appendChild(row);
		}
	}
};
