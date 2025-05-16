import { Pylon, PylonIterator } from "asxnc";
import * as vscode from "vscode";
import { log } from "../logger";
import { GitRepository } from "./git/GitRepository";
import { GitExtension } from "./vscode.git/types";

const debug = log("VSCodeGitManager");

export class RepositoryManager {
	public repositories: PylonIterator<Record<string, GitRepository>> = null!;

	constructor(
		public readonly extension: GitExtension = RepositoryManager.getExtension(),
	) {}

	start(): Disposable {
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

		const subs = [
			api.onDidChangeState((a) => {
				debug("State changed");
				// TODO: handle git state changes
			}),
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
		];

		return {
			[Symbol.dispose]: () => {
				for (const sub of subs) {
					sub.dispose();
				}
			},
		};
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
