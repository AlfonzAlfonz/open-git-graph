import { Pylon, PylonIterator } from "@alfonz/async";
import * as vscode from "vscode";
import { log } from "../logger";
import { signalDisposable } from "../utils";
import { RepositoryStateHandle } from "./RepositoryStateHandle";
import { GitRepository } from "./git/GitRepository";
import { GitExtension } from "./vscode.git/types";

const debug = log("RepositoryManager");

export class RepositoryManager {
	public repositories: PylonIterator<Record<string, GitRepository>> = null!;

	private state: Record<string, RepositoryStateHandle> = {};

	constructor(
		private appSignal: AbortSignal,
		public readonly extension: GitExtension = RepositoryManager.getExtension(),
	) {}

	public async getRepository(path: string) {
		const repositories = await this.repositories.read();

		return repositories[path];
	}

	public getStateHandle(repository: GitRepository) {
		const path = repository.getPath();

		if (path in this.state) {
			return this.state[path]!;
		}

		const handle = new RepositoryStateHandle(repository);
		this.state[path] = handle;

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
					new GitRepository(r.rootUri, api),
				]),
			),
		);

		signalDisposable(
			this.appSignal,
			api.onDidOpenRepository((r) => {
				swap({
					...repositories.readSync(),
					[r.rootUri.toString()]: new GitRepository(r.rootUri, api),
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
