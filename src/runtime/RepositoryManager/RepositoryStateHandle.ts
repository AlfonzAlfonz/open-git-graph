import { collect, fork, Mutex, Pylon } from "asxnc";
import { GitCommit, GitRef } from "../../universal/git";
import { createGraphNodes, Graph } from "../GraphTabManager/createGraphNodes";
import { batch } from "../utils";
import { GitRepository } from "./git/GitRepository";

type RepositoryState = {
	refs: GitRef[];

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

			const [refs, index] = await fork([
				async () => {
					return await collect(this.repository.getRefs());
				},
				() => this.repository.getIndex(),
			]);

			const { commits, stashes } = await this.repository.getCommits();

			const iterator = commits[Symbol.asyncIterator]();

			const graphIterator = createGraphNodes(
				await collect(take(iterator, 100)),
				index,
				stashes,
			);

			this.pylon.swap({
				graph: graphIterator.next().value!,
				refs: [
					...refs,
					...stashes.map((s) => ({ type: "stash" as const, hash: s.hash })),
				],
			});

			value.graphIterator = pipeCommitsToGraph(iterator, graphIterator);
		});
	}

	async checkout(branch: string) {
		return await this.repository.checkout(branch);
	}
}

async function* take<T>(iterator: AsyncIterator<T>, count: number) {
	let i = 0;
	while (i < count) {
		const result = await iterator.next();
		if (result.done) {
			return result.value;
		} else {
			yield result.value;
		}
		i++;
	}
}

async function* pipeCommitsToGraph<T, U>(
	ait: AsyncIterator<T>,
	it: Iterator<U, void, Iterable<T>>,
) {
	for await (const value of batch({ [Symbol.asyncIterator]: () => ait }, 50)) {
		const result = it.next(value);
		if (result.done) {
			return;
		} else {
			yield result.value;
		}
	}
}
