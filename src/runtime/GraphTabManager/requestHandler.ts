import * as vscode from "vscode";
import { WebToRuntimeBridge } from "../../universal/protocol";
import { buffer } from "../utils";
import { ShowFileTextDocumentContentProvider } from "../ShowFileTextDocumentContentProvider";
import { handleError } from "../handleError";
import { GitRepository } from "../RepositoryManager/git/GitRepository";

export class WebviewRequestHandler implements WebToRuntimeBridge {
	constructor(
		private repository: GitRepository,
		private panel: vscode.WebviewPanel,
	) {}

	async getGraphData() {
		const { repoPath } = this.getOwnState();

		const dispatchCommits = async () => {
			const log = await this.repository.getCommits();
			const commits = await buffer(log.commits);
			return { commits };
		};

		const dispatchRefs = async () => {
			return await buffer(this.repository.getRefs());
		};

		const [{ commits }, refs, index] = await Promise.all([
			dispatchCommits(),
			dispatchRefs(),
			this.repository.getIndex(),
		]);

		return {
			repoPath,
			index,
			commits,
			refs,
		};
	}

	async showDiff(path: string, a?: string, b?: string) {
		const repoPath = this.getOwnState().repoPath;

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

	async logError(content: string) {
		handleError(content);
	}

	async getState() {
		const { expandedCommit, scroll } = this.getOwnState();
		return { expandedCommit, scroll };
	}

	async expandCommit(value?: string | undefined) {
		const state = this.getOwnState();
		state.expandedCommit = value;
	}

	async scroll(value: number) {
		const state = this.getOwnState();
		state.scroll = value;
	}

	private getOwnState() {
		return {
			repoPath: this.repository.repository.rootUri.toString(),
			expandedCommit: undefined as string | undefined,
			scroll: 0,
		};
	}
}
