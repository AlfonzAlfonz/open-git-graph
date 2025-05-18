import { GitCommit, GitIndex } from "../../../universal/git";
import { GraphNode } from "./index";

export type RailsState = {
	rails: Rail[];
	nextId: number;
};

export type Rail = {
	id: RailId;
	next: string;
};

declare const idBrand: unique symbol;
export type RailId = number & { [idBrand]: typeof idBrand };

export class Rails {
	private usedHashes = new Set<string>();
	public readonly state: RailsState = { rails: [], nextId: 0 };

	public constructor(private stashHashes: Set<string>) {}

	add(commit: GitCommit | GitIndex): GraphNode | undefined {
		if ("hash" in commit && this.usedHashes.has(commit.hash)) {
			return undefined;
		}

		const children = [...this.getChildren(commit)];
		const rails = this.state.rails.map((r) => r.id);
		let position: RailId;
		let forks: RailId[] = [];
		let merges: RailId[] = [];

		if (children.length === 0) {
			// If commit does not have any children create a new rail
			const rail = { next: commit.parents[0]!, id: this.id() };

			this.state.rails.push(rail);

			forks = [rail.id];
			position = rail.id;
		} else {
			// If commit does have any child assign it to first child rail and mark rest as forks
			let first: RailId;
			[first, ...forks] = children as [RailId, ...RailId[]];

			const newRails: Rail[] = [];

			for (const r of this.state.rails) {
				if (r.id === first) {
					newRails.push({ next: commit.parents[0]!, id: first });
					// Discard forked rails
				} else if (!forks.includes(r.id)) {
					newRails.push(r);
				}
			}
			this.state.rails = newRails;
			position = first;
		}

		if (
			commit.parents.length > 1 &&
			"hash" in commit &&
			!this.stashHashes.has(commit.hash)
		) {
			const [, ...mergedParents] = [...commit.parents];
			for (const parent of mergedParents) {
				const rail = { next: parent, id: this.id() };
				this.state.rails.push(rail);
				merges.push(rail.id);
			}
		}

		if ("hash" in commit) {
			this.usedHashes.add(commit.hash);
		}

		return {
			commit,
			position,
			rails,
			forks,
			merges,
		};
	}

	private id() {
		return this.state.nextId++ as RailId;
	}

	*getChildren(commit: GitCommit | GitIndex) {
		if (!("hash" in commit)) return;

		for (const r of this.state.rails) {
			if (r.next === commit.hash) {
				yield r.id;
			}
		}
	}
}
