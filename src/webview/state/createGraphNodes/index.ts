import { GitCommit } from "../../../types/git.js";
import { RailId, Rails, RailsState } from "./Rails.js";

/**
 * Structure representing node ordered by date descending.
 * This may be confusing, because one commit commited before
 * another is first in the structure but refered to as after.
 */
export type Graph = {
	nodes: GraphNode[];
	rails: RailsState;
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
	const hashes = new Set(commitHashes(commits, prev?.nodes));
	const rails = new Rails(prev?.rails, hashes);

	const graph: Graph = {
		nodes: prev?.nodes ?? [],
		rails: rails.state,
	};

	for (const c of commits) {
		const r = rails.add(c);
		graph.nodes.push(r);
	}

	return graph;
};

function* commitHashes(commits: GitCommit[], prev?: GraphNode[]) {
	for (const c of commits) {
		yield c.hash;
	}
	if (prev)
		for (const n of prev) {
			yield n.commit.hash;
		}
}
