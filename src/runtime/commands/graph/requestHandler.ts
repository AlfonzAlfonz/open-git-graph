import * as vscode from "vscode";
import { WebToRuntimeBridge } from "../../../universal/protocol";
import { ShowFileTextDocumentContentProvider } from "../../ShowFileTextDocumentContentProvider";
import { RuntimeStore } from "../../store";
import { buffer } from "../../utils";
import { handleError } from "../../handleError";

export class WebviewRequestHandler implements WebToRuntimeBridge {
	constructor(
		private store: RuntimeStore,
		private panel: vscode.WebviewPanel,
	) {}

	async getGraphData() {
		const { repoPath } = this.getOwnState();
		const git = this.store.getGitRepository(repoPath);

		const dispatchCommits = async () => {
			const log = await git.getCommits();
			const commits = await buffer(log.commits);
			return { commits };
		};

		const dispatchRefs = async () => {
			return await buffer(git.getRefs());
		};

		const [{ commits }, refs, index] = await Promise.all([
			dispatchCommits(),
			dispatchRefs(),
			git.getIndex(),
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
		const git = this.store.getGitRepository(this.panel);
		await git.checkout(branch);
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
		return this.store.getPanelState(this.panel)!;
	}
}
