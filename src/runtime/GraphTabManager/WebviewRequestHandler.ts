import * as vscode from "vscode";
import { GitCommit } from "../../universal/git";
import { GraphTabState, WebToRuntimeBridge } from "../../universal/protocol";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { RepositoryStateHandle } from "../RepositoryManager/RepositoryStateHandle";
import { ShowFileTextDocumentContentProvider } from "../ShowFileTextDocumentContentProvider";
import path from "path";

export class WebviewRequestHandler implements WebToRuntimeBridge {
	constructor(
		private repository: GitRepository,
		private handle: RepositoryStateHandle,
		private state: GraphTabState,
	) {}

	async ready(_repoPath?: string | undefined) {
		void this.handle.getGraphData();

		return this.state;
	}

	async reload() {
		await this.handle.getGraphData(true);
	}

	async fetch() {
		await this.handle.fetch();
	}

	async pollGraphData(): Promise<void> {
		await this.handle.pollGraphData();
	}

	async getCommit(hash: string): Promise<GitCommit> {
		return await this.repository.getCommit(hash);
	}

	async showDiff(p: string, a?: string, b?: string) {
		const repoPath = this.state.repoPath;

		await vscode.commands.executeCommand(
			"vscode.diff",
			ShowFileTextDocumentContentProvider.createUri(a, p, repoPath),
			ShowFileTextDocumentContentProvider.createUri(b, p, repoPath),
			`${path.basename(p)} ${
				a !== undefined ? `(${a.slice(0, 8)})` : ""
			} ↔ ${path.basename(p)} ${b !== undefined ? `(${b.slice(0, 8)})` : ""}`,
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
