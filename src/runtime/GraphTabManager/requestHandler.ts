import { collect } from "asxnc";
import * as vscode from "vscode";
import { RuntimeMessage, runtimeMessage } from "../../universal/message";
import { GraphState, WebToRuntimeBridge } from "../../universal/protocol";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { ShowFileTextDocumentContentProvider } from "../ShowFileTextDocumentContentProvider";
import { GraphTabManager } from "./GraphTabManager";
import { createGraphNodes } from "./createGraphNodes";
import { ensureLogger } from "../logger";

export class WebviewRequestHandler implements WebToRuntimeBridge {
	private log = ensureLogger("WebviewRequestHandler");

	constructor(
		private manager: GraphTabManager,
		private repository: GitRepository,
		private getOwnState: () => GraphState,
		private panel: vscode.WebviewPanel,
		private postMessage: (msg: RuntimeMessage) => void,
	) {}

	async ready(repoPath?: string | undefined) {
		this.getGraphData();

		return this.repository.getPath();
	}

	async getGraphData() {
		const dispatchRefs = async () => {
			return await collect(this.repository.getRefs());
		};

		const [refs, index] = await Promise.all([
			dispatchRefs(),
			this.repository.getIndex(),
		]);

		const commits = await AsyncIterator.from(
			(await this.repository.getCommits()).commits,
		)
			.take(100)
			.toArray();

		this.postMessage(
			runtimeMessage("graph", {
				graph: createGraphNodes(commits, index),
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

	// async logError(content: string) {
	// 	handleError(content);
	// }

	async expandCommit(value?: string | undefined) {
		const state = this.getOwnState();
		state.expandedCommit = value;
	}

	async scroll(value: number) {
		const state = this.getOwnState();
		state.scroll = value;
	}

	// async getState(): Promise<GraphState> {
	// 	return this.getOwnState();
	// }
}
