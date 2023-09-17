import { GitCommit } from "../../types/git.js";
import { RailId, Rails } from "./rails.js";

/**
 * Structure representing node ordered by date descending.
 * This may be confusing, because one commit commited before
 * another is first in the structure but refered to as after.
 */
export type Graph = {
	nodes: GraphNode[];
	width: number;
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

export const createGraphNodes = (commits: GitCommit[]): Graph => {
	const graph: Graph = {
		nodes: [],
		width: 0,
	};

	let rails = new Rails();

	for (const c of commits) {
		const r = rails.add(c);
		graph.nodes.push(r);
		graph.width = Math.max(r.rails.length, graph.width);
	}

	return graph;
};
