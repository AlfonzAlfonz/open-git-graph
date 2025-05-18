import { collect, fork } from "asxnc";
import * as vscode from "vscode";
import { RuntimeMessage, runtimeMessage } from "../../universal/message";
import { WebToRuntimeBridge } from "../../universal/protocol";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { ShowFileTextDocumentContentProvider } from "../ShowFileTextDocumentContentProvider";
import { batch } from "../utils";
import { GraphTabState } from "./GraphTabManager";
import { createGraphNodes } from "./createGraphNodes";

export class WebviewRequestHandler implements WebToRuntimeBridge {
	constructor(
		private repository: GitRepository,
		private getOwnState: () => GraphTabState,
		private postMessage: (msg: RuntimeMessage) => void,
	) {}

	async ready(repoPath?: string | undefined) {
		this.getGraphData();

		return {
			...this.getOwnState(),
			repoPath: this.repository.getPath(),
		};
	}

	async pollGraphData(): Promise<void> {
		const state = this.getOwnState();
		const graph = await state.graphIterator?.acquire(
			async (value) => (await value.iterator!.next()).value!,
		)!;

		this.postMessage(runtimeMessage("graph-poll", { graph }));
	}

	async getGraphData(force?: boolean) {
		const state = this.getOwnState();

		const data = await state.graphIterator.acquire(async (value) => {
			if (!force && value.iterator && state.refs) {
				return {
					graph: (await value.iterator.next()).value!,
					refs: state.refs,
				};
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

			value.iterator = pipeCommitsToGraph(iterator, graphIterator);

			return {
				graph: graphIterator.next().value!,
				refs: [
					...refs,
					...stashes.map((s) => ({ type: "stash" as const, hash: s.hash })),
				],
			};
		});

		this.postMessage(runtimeMessage("graph", data));
	}

	async showDiff(path: string, a?: string, b?: string) {
		const repoPath = this.repository.getPath();

		await vscode.commands.executeCommand(
			"vscode.diff",
			ShowFileTextDocumentContentProvider.createUri(a, path, repoPath),
			ShowFileTextDocumentContentProvider.createUri(b, path, repoPath),
			"Swag",
		);
	}

	async checkout(branch: string) {
		await this.repository.checkout(branch);
	}

	async expandCommit(value?: string | undefined) {
		this.getOwnState().expandedCommit = value;
	}

	async scroll(value: number) {
		this.getOwnState().scroll = value;
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
