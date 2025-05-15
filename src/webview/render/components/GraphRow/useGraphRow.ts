import { MouseEvent } from "react";
import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitCommit, GitIndex } from "../../../../universal/git";
import { GraphTag } from "../../../state/toGraphTags";
import { getColor } from "../../utils";
import { useAppContext } from "../AppContext";

export type UseGraphRowOptions<T extends GitCommit | GitIndex> = {
	node: GraphNode<T>;
	tags?: GraphTag[];
};

export const useGraphRow = <T extends GitCommit | GitIndex>({
	node,
	tags,
}: UseGraphRowOptions<T>) => {
	const { actions } = useAppContext();

	const { expandedCommit } = useAppContext();
	const id = "hash" in node.commit ? node.commit.hash : "index";

	const onClick = async (e: MouseEvent) => {
		if (e.detail > 1) return;

		actions.expandCommit(expandedCommit === id ? undefined : id);
	};

	const isHead = tags?.some((r) => r.type === "head");

	return {
		onClick,
		open: expandedCommit === id,
		className: `graph-row ${isHead ? "head" : ""} ${
			node.commit.parents.length > 1 ? "merge" : ""
		} ${expandedCommit === id ? "focused" : ""} ${getColor(node.position)}`,
	};
};
