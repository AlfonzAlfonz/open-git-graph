import { collect, Mutex, Pylon } from "@alfonz/async";
import { GitCommit, GitRef } from "../../universal/git";
import { createGraphNodes, Graph } from "../GraphTabManager/createGraphNodes";
import { pipeThrough, take } from "../utils";
import { GitRepository } from "./git/GitRepository";

type RepositoryState = {
	refs: GitRef[];
	currentBranch: string | undefined;

	graph: Graph;
};

type InnerState = {
	graphIterator?: AsyncIterator<Graph, void, Iterable<GitCommit>>;
};

export class RepositoryStateHandle {
	private innerState: Mutex<InnerState> = Mutex.create({});

	private pylon = Pylon.create<RepositoryState>();

	constructor(private repository: GitRepository) {}

	get state() {
		return this.pylon.iterator;
	}

	async pollGraphData() {
		await this.innerState.acquire(async (value) => {
			const graph = (await value.graphIterator!.next()).value!;

			this.pylon.swap((s) => ({ ...s, graph }));
		})!;
	}

	async getGraphData(force?: boolean) {
		await this.innerState.acquire(async (value) => {
			if (!force && this.state.readSync()) {
				this.pylon.bump();
				return;
			}

			console.time("fetch git commits");

			const commits = this.repository.getCommits();

			const [refs, index, stashes] = await Promise.all([
				collect(this.repository.getRefs()),
				this.repository.getIndex(),
				collect(this.repository.getStashes()),
			]);

			const commitsWithStashes = this.repository.addStashes(commits, stashes);

			console.timeEnd("fetch git commits");

			console.time("collect commits");

			const iterator = commitsWithStashes[Symbol.asyncIterator]();
			const data = await collect(take(iterator, 100));

			console.timeEnd("collect commits");

			const graphIterator = createGraphNodes(data, index, stashes);

			const graph = graphIterator.next().value!;

			this.pylon.swap({
				graph,
				currentBranch: index.branch,
				refs: [
					...refs,
					...stashes.map((s) => ({ type: "stash" as const, hash: s.hash })),
				],
			});

			value.graphIterator = pipeThrough(iterator, graphIterator);
		});
	}

	async checkout(branch: string) {
		return await this.repository.checkout(branch);
	}
}
