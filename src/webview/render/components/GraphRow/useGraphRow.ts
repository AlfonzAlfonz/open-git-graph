import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitCommit, GitIndex } from "../../../../universal/git";
import { GraphBadge } from "../../../state/toGraphBadges";
import { useAppContext } from "../../contexts/AppContext";

export type UseGraphRowOptions<T extends GitCommit | GitIndex> = {
	node: GraphNode<T>;
	badges?: GraphBadge[];
};

export const useGraphRow = <T extends GitCommit | GitIndex>({
	node,
	badges,
}: UseGraphRowOptions<T>) => {
	const { actions, expandedCommit } = useAppContext();
	const id = "hash" in node.commit ? node.commit.hash : "index";

	const onClick = async () => {
		actions.expandCommit(expandedCommit === id ? undefined : id);
	};

	const isHead = badges?.some((r) => r.type === "head");

	return {
		onClick,
		open: expandedCommit === id,
		isHead,
	};
};
