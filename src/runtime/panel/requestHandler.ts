import * as vscode from "vscode";
import { WebToRuntimeBridge } from "../../universal/protocol";
import { RuntimeStore } from "../state/types";
import { GitRepository } from "../git/GitRepository";
import { buffer } from "../utils";
import { ShowFileTextDocumentContentProvider } from "../ShowFileTextDocumentContentProvider";
import { handleError } from "../handleError";

export class WebviewRequestHandler implements WebToRuntimeBridge {
	constructor(
		private store: RuntimeStore,
		private panel: vscode.WebviewPanel,
	) {}

	async getGraphData() {
		const state = this.store.getState();
		const panelState = state.panels.get(this.panel)!;

		const git = new GitRepository(state, panelState.repoPath);

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
			repoPath: panelState.repoPath,
			index,
			commits,
			refs,
		};
	}

	async showDiff(path: string, a?: string, b?: string) {
		const state = this.store.getState();
		const panelState = state.panels.get(this.panel)!;
		const repoPath = panelState.repoPath;

		await vscode.commands.executeCommand(
			"vscode.diff",
			ShowFileTextDocumentContentProvider.createUri(a, path, repoPath),
			ShowFileTextDocumentContentProvider.createUri(b, path, repoPath),
			"Swag",
		);
	}

	async checkout(branch: string) {
		const state = this.store.getState();
		const panelState = state.panels.get(this.panel)!;

		const git = new GitRepository(state, panelState.repoPath);

		await git.checkout(branch);
	}

	async logError(content: string) {
		const state = this.store.getState();

		handleError(state)(content);
	}

	async getState() {
		return {
			scroll: 0,
		};
	}

	async expandCommit(value?: string | undefined) {}

	async scroll(value: number) {}
}
