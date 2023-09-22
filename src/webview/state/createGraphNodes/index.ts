import { GitCommit } from "../../../types/git.js";
import { RailId, Rails } from "./Rails.js";

/**
 * Structure representing node ordered by date descending.
 * This may be confusing, because one commit commited before
 * another is first in the structure but refered to as after.
 */
export type Graph = {
	nodes: GraphNode[];
	rails: Rails;
};

export type GraphNode = {
	commit: GitCommit;
	position: RailId;

	/** State of rails after this commit */
	rails: RailId[];

	/** Which rails from are being created or forked from an existing one */
	forks: RailId[];

	/** Which rails are being merged to this commit */
	merges: RailId[];
};

export const createGraphNodes = (commits: GitCommit[], prev?: Graph): Graph => {
	const graph: Graph = {
		nodes: prev?.nodes ?? [],
		rails: prev?.rails ?? new Rails(),
	};

	for (const c of commits) {
		const r = graph.rails.add(c);
		graph.nodes.push(r);
	}

	return graph;
};
