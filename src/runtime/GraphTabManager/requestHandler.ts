import { collect, Mutex } from "asxnc";
import * as vscode from "vscode";
import { RuntimeMessage, runtimeMessage } from "../../universal/message";
import { WebToRuntimeBridge } from "../../universal/protocol";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { ShowFileTextDocumentContentProvider } from "../ShowFileTextDocumentContentProvider";
import { ensureLogger } from "../logger";
import { GraphTabManager, GraphTabState } from "./GraphTabManager";
import { createGraphNodes } from "./createGraphNodes";
import { batch } from "../utils";

export class WebviewRequestHandler implements WebToRuntimeBridge {
	private log = ensureLogger("WebviewRequestHandler");

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
			async (it) => (await it.next()).value!,
		)!;

		this.postMessage(runtimeMessage("graph-poll", { graph }));
	}

	async getGraphData() {
		const dispatchRefs = async () => {
			return await collect(this.repository.getRefs());
		};

		const [refs, index] = await Promise.all([
			dispatchRefs(),
			this.repository.getIndex(),
		]);

		const iterator = (await this.repository.getCommits()).commits[
			Symbol.asyncIterator
		]();

		const graphIterator = createGraphNodes(
			await collect(take(iterator, 100)),
			index,
		);

		this.getOwnState().graphIterator = Mutex.create(
			pipeCommitsToGraph(iterator, graphIterator),
		);

		this.postMessage(
			runtimeMessage("graph", {
				graph: graphIterator.next().value!,
				refs,
			}),
		);
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
