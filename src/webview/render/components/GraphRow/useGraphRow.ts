import { MouseEvent } from "react";
import { GitCommit, GitIndex } from "../../../../universal/git.js";
import { getColor } from "../../../state/createGraphNodes/Rails.js";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { useWebviewStore } from "../../../state/index.js";
import { GraphTag } from "../../../state/toGraphTags.js";

export type UseGraphRowOptions<T extends GitCommit | GitIndex> = {
	node: GraphNode<T>;
	tags?: GraphTag[];
};

export const useGraphRow = <T extends GitCommit | GitIndex>({
	node,
	tags,
}: UseGraphRowOptions<T>) => {
	const { expandedCommit, dispatch } = useWebviewStore();

	const id = "hash" in node.commit ? node.commit.hash : "index";

	const onClick = (e: MouseEvent) => {
		if (e.detail > 1) return;
		dispatch({ type: "EXPAND_COMMMIT", commit: id });
	};

	const isHead = tags?.some((r) => r.type === "head");

	return {
		onClick,
		className: `graph-row ${isHead ? "head" : ""} ${
			node.commit.parents.length > 1 ? "merge" : ""
		} ${expandedCommit === id ? "focused" : ""} ${getColor(node.position)}`,
	};
};
