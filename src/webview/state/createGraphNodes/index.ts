import { GitCommit, GitIndex } from "../../../universal/git.js";
import { RailId, Rails, RailsState } from "./Rails.js";

/**
 * Structure representing node ordered by date descending.
 * This may be confusing, because one commit commited before
 * another is first in the structure but refered to as after.
 */
export type Graph = {
	nodes: GraphNode<GitCommit | GitIndex>[];
	rails: RailsState;
};

export type GraphNode<T extends GitCommit | GitIndex = GitCommit | GitIndex> = {
	commit: T;
	position: RailId;

	/** State of rails after this commit */
	rails: RailId[];

	/** Which rails from are being created or forked from an existing one */
	forks: RailId[];

	/** Which rails are being merged to this commit */
	merges: RailId[];
};

export const createGraphNodes = (
	commits: GitCommit[],
	index?: GitIndex,
	prev?: Graph,
): Graph => {
	const hashes = new Set(commitHashes(commits, prev?.nodes));

	const nodes = prev?.nodes ?? [];

	let rails: Rails = new Rails(prev?.rails, hashes);
	if (index) {
		nodes.push(rails.add(index));
	}

	const graph: Graph = {
		nodes,
		rails: rails.state,
	};

	for (const c of commits) {
		graph.nodes.push(rails.add(c));
	}

	return graph;
};

function* commitHashes(commits: GitCommit[], prev?: GraphNode[]) {
	for (const c of commits) {
		yield c.hash;
	}
	if (prev)
		for (const n of prev) {
			if ("hash" in n.commit) {
				yield n.commit.hash;
			}
		}
}
