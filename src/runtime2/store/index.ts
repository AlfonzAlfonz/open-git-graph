import * as vscode from "vscode";
import { RuntimeToWebBridge } from "../../universal/protocol/index";
import { GitRepository } from "../../runtime/RepositoryManager/git/GitRepository";
import { ensureGitExtension } from "./vscode.git/index";
import { GitExtension, Repository } from "./vscode.git/types";
import { Lazy, RuntimeState } from "./types";
import { watchGit } from "./watchGit";
import { ensureLogger } from "../logger";

export class RuntimeStore {
	private state: RuntimeState;

	constructor(extension: GitExtension) {
		this.state = {
			extension,
			repository: {},
			panels: new Map(),
		};
	}

	public getState() {
		return this.state;
	}

	public setRepository(repository: Repository) {
		this.state.repository[repository.rootUri.toString()] = repository;
	}

	public removeRepository(rootUri: vscode.Uri) {
		delete this.state.repository[rootUri.toString()];
	}

	public addPanel(
		panel: vscode.WebviewPanel,
		repoPath: string,
		bridge: RuntimeToWebBridge,
	) {
		this.state.panels.set(panel, {
			repoPath,
			expandedCommit: undefined,
			scroll: 0,
			bridge,
		});
	}

	public removePanel(panel: vscode.WebviewPanel) {
		this.state.panels.delete(panel);
	}

	public getPanelState(panel: vscode.WebviewPanel) {
		return this.state.panels.get(panel);
	}

	public getGitRepository(repoOrPanel: string | vscode.WebviewPanel) {
		const repo =
			this.state.repository[
				typeof repoOrPanel === "string"
					? repoOrPanel
					: this.state.panels.get(repoOrPanel)!.repoPath
			];

		if (!repo) {
			throw new Error("Invalid repo path");
		}

		return new GitRepository(repo, this.state.extension, ensureLogger());
	}
}

export const lazyRuntimeStore = (): Lazy<RuntimeStore> => {
	return {
		ensure: () => {
			const git = ensureGitExtension();
			const store = new RuntimeStore(git.exports);
			watchGit(store);
			return store;
		},
	};
};
