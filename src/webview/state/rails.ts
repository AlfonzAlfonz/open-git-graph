import { GitCommit } from "../../types/git.js";
import { GraphNode } from "./createGraphNodes.js";

export type Rail = {
	id: RailId;
	next: string;
};

declare const idBrand: unique symbol;
export type RailId = number & { [idBrand]: typeof idBrand };

export class Rails {
	private rails: Rail[] = [];
	private nextId = 0;

	add(commit: GitCommit): GraphNode {
		const children = [...this.getChildren(commit)];
		const rails = this.rails.map((r) => r.id);
		let position: RailId;
		let forks: RailId[] = [];
		let merges: RailId[] = [];

		if (children.length === 0) {
			// If commit does not have any children create a new rail
			const rail = { next: commit.parents[0]!, id: this.id() };

			this.rails.push(rail);

			forks = [rail.id];
			position = rail.id;
		} else {
			// If commit does have any child assign it to first child rail and mark rest as forks
			let first: RailId;
			[first, ...forks] = children as [RailId, ...RailId[]];

			const newRails: Rail[] = [];

			for (const r of this.rails) {
				if (r.id === first) {
					newRails.push({ next: commit.parents[0]!, id: first });
				} else if (!forks.includes(r.id)) {
					// Discard forked rails
					newRails.push(r);
				}
			}
			this.rails = newRails;
			position = first;
		}

		if (commit.parents.length > 1) {
			// log(commit.subject, commit.parents);
			const [, ...mergedParents] = [...commit.parents];
			for (const parent of mergedParents) {
				const rail = { next: parent, id: this.id() };
				this.rails.push(rail);
				merges.push(rail.id);
			}
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
		return this.nextId++ as RailId;
	}

	*getChildren(commit: GitCommit) {
		for (const r of this.rails) {
			if (r.next === commit.hash) {
				yield r.id;
			}
		}
	}
}
