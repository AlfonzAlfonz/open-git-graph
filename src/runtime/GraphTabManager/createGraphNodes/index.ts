import { GitCommit, GitIndex } from "../../../universal/git";
import { RailId, Rails, RailsState } from "./Rails";

/**
 * Structure representing node ordered by date descending.
 * This may be confusing, because one commit committed before
 * another is first in the structure but referred to as after.
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

export type GraphGenerator = Generator<Graph, void, Iterable<GitCommit> | void>;

export function* createGraphNodes(
	commitQueue: Iterable<GitCommit>,
	index: GitIndex | undefined,
	stashes: GitCommit[],
): GraphGenerator {
	const queue = [commitQueue];
	const stashHashes = new Set(commitHashes(stashes));

	const nodes = [];

	const rails = new Rails(stashHashes);
	if (index && (index.tracked.length || index.untracked.length)) {
		nodes.push(rails.add(index)!);
	}

	const graph: Graph = {
		nodes,
		rails: rails.state,
	};

	while (true) {
		const commits = queue.shift();

		if (!commits) {
			break;
		}

		for (const [c, n] of withPrev(commits)) {
			const node = rails.add(c, n);
			node && graph.nodes.push(node);
		}

		const newCommits = yield graph;
		newCommits && queue.push(newCommits);
	}
}

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

export function* withPrev<T>(
	it: Iterable<T>,
): Generator<[T, T | undefined], void> {
	let prev: T | undefined;
	let first = false;

	for (const item of it) {
		if (first) {
			yield [prev!, item];
		}
		prev = item;
		first = true;
	}

	if (first) {
		yield [prev!, undefined];
	}
}
