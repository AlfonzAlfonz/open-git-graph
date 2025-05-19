import * as vscode from "vscode";
import { GitCommit } from "../../universal/git";
import { GraphTabState, WebToRuntimeBridge } from "../../universal/protocol";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { RepositoryStateHandle } from "../RepositoryManager/RepositoryStateHandle";
import { ShowFileTextDocumentContentProvider } from "../ShowFileTextDocumentContentProvider";
import { batch } from "../utils";

export class WebviewRequestHandler implements WebToRuntimeBridge {
	constructor(
		private repository: GitRepository,
		private handle: RepositoryStateHandle,
		private state: GraphTabState,
	) {}

	async ready(repoPath?: string | undefined) {
		await this.handle.getGraphData();

		return this.state;
	}

	async pollGraphData(): Promise<void> {
		await this.handle.pollGraphData();
	}

	async getCommit(hash: string): Promise<GitCommit> {
		return await this.repository.getCommit(hash);
	}

	async showDiff(path: string, a?: string, b?: string) {
		const repoPath = this.state.repoPath;

		await vscode.commands.executeCommand(
			"vscode.diff",
			ShowFileTextDocumentContentProvider.createUri(a, path, repoPath),
			ShowFileTextDocumentContentProvider.createUri(b, path, repoPath),
			"Swag",
		);
	}

	async checkout(branch: string) {
		await this.handle.checkout(branch);
	}

	async expandCommit(value?: string | undefined) {
		this.state.expandedCommit = value;
	}

	async scroll(value: number) {
		this.state.scroll = value;
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
