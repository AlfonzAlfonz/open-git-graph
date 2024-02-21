import { MouseEvent } from "react";
import { GitCommit, GitIndex } from "../../../universal/git";
import { bridge } from "../../../bridge";
import { getColor } from "../../state/createGraphNodes/Rails";
import { GraphNode } from "../../state/createGraphNodes/index";
import { GraphTag } from "../../state/toGraphTags";
import { invalidate, useBridge } from "../useBridge/useBridge";
import { useBridgeMutation } from "../useBridge/useBridgeMutation";

export type UseGraphRowOptions<T extends GitCommit | GitIndex> = {
	node: GraphNode<T>;
	tags?: GraphTag[];
};

export const useGraphRow = <T extends GitCommit | GitIndex>({
	node,
	tags,
}: UseGraphRowOptions<T>) => {
	const expandCommit = useBridgeMutation(bridge.expandCommit);

	const state = useBridge(bridge.getState, []);
	const id = "hash" in node.commit ? node.commit.hash : "index";

	const onClick = async (e: MouseEvent) => {
		if (e.detail > 1) return;

		await expandCommit.mutateAsync([
			state.data?.expandedCommit === id ? undefined : id,
		]);
		await invalidate(bridge.getState, []);
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
