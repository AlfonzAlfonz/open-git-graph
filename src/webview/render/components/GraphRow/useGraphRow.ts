import { MouseEvent } from "react";
import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitCommit, GitIndex } from "../../../../universal/git";
import { bridge } from "../../../bridge";
import { GraphTag } from "../../../state/toGraphTags";
import { useBridgeMutation } from "../../useBridge/useBridgeMutation";
import { useGetState } from "../../useGetState";
import { getColor } from "../../utils";

export type UseGraphRowOptions<T extends GitCommit | GitIndex> = {
	node: GraphNode<T>;
	tags?: GraphTag[];
};

export const useGraphRow = <T extends GitCommit | GitIndex>({
	node,
	tags,
}: UseGraphRowOptions<T>) => {
	const [expandCommit] = useBridgeMutation(bridge.expandCommit);

	const state = useGetState();
	const id = "hash" in node.commit ? node.commit.hash : "index";

	const onClick = async (e: MouseEvent) => {
		if (e.detail > 1) return;

		await expandCommit(state.data?.expandedCommit === id ? undefined : id);
	};

	const isHead = tags?.some((r) => r.type === "head");

	return {
		onClick,
		open: state.data?.expandedCommit === id,
		className: `graph-row ${isHead ? "head" : ""} ${
			node.commit.parents.length > 1 ? "merge" : ""
		} ${state.data?.expandedCommit === id ? "focused" : ""} ${getColor(
			node.position,
		)}`,
	};
};
