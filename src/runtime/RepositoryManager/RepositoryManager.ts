import { fork, Pylon, PylonIterator } from "asxnc";
import * as vscode from "vscode";
import { log } from "../logger";
import { GitRepository } from "./git/GitRepository";
import { GitExtension } from "./vscode.git/types";
import { RepositoryStateHandle } from "./RepositoryStateHandle";
import { aggregateGitEvents, watchGit } from "./gitWatch/watchGit";
import { signalDisposable } from "../utils";

const debug = log("RepositoryManager");

export class RepositoryManager {
	public repositories: PylonIterator<Record<string, GitRepository>> = null!;

	private state: Record<string, RepositoryStateHandle> = {};

	constructor(
		private appSignal: AbortSignal,
		public readonly extension: GitExtension = RepositoryManager.getExtension(),
	) {}

	public getStateHandle(repository: GitRepository) {
		const path = repository.getPath();

		if (path in this.state) {
			return this.state[path]!;
		}

		const handle = new RepositoryStateHandle(repository);
		this.state[path] = handle;

		fork(async () => {
			const watcher = aggregateGitEvents(
				watchGit(repository.getFsPath(), this.appSignal),
			);

			for await (const _ of watcher) {
				this.state[path]?.getGraphData(true);
			}
		});

		return handle;
	}

	start() {
		debug("started");

		const [repositories, swap] = Pylon.create<Record<string, GitRepository>>();
		this.repositories = repositories;

		const api = this.extension.getAPI(1);

		swap(
			Object.fromEntries(
				api.repositories.map((r) => [
					r.rootUri.toString(),
					new GitRepository(r, this.extension),
				]),
			),
		);

		signalDisposable(
			this.appSignal,
			api.onDidOpenRepository((r) => {
				swap({
					...repositories.readSync(),
					[r.rootUri.toString()]: new GitRepository(r, this.extension),
				});
			}),
			api.onDidCloseRepository((e) => {
				const repository = {
					...repositories.readSync(),
				};
				delete repository[e.rootUri.toString()];
				swap(repository);
			}),
		);
	}

	static getExtension() {
		const git = vscode.extensions.getExtension<GitExtension>("vscode.git");

		if (!git) {
			vscode.window.showErrorMessage(
				"Preinstalled vscode.git extension is not activated",
			);
			throw new Error("Preinstalled vscode.git extension is not activated");
		}

		return git.exports;
	}
}
