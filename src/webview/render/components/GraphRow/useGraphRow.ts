import { MouseEvent } from "react";
import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitCommit, GitIndex } from "../../../../universal/git";
import { GraphTag } from "../../../state/toGraphTags";
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
		actions.expandCommit(expandedCommit === id ? undefined : id);
	};

	const isHead = tags?.some((r) => r.type === "head");

	return {
		onClick,
		open: expandedCommit === id,
		isHead,
	};
};
