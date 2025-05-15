import qs from "node:querystring";
import * as vscode from "vscode";
import { GitRepository } from "./RepositoryManager/git/GitRepository";
import { only } from "./utils";
import { RepositoryManager } from "./RepositoryManager/RepositoryManager";

export class ShowFileTextDocumentContentProvider
	implements vscode.TextDocumentContentProvider
{
	public static scheme = "open-git-graph-showFile";

	public static createUri(
		ref: string | undefined,
		path: string,
		repo: string | GitRepository,
	) {
		return vscode.Uri.from({
			scheme: this.scheme,
			authority: ref,
			path: "/" + path,
			query: `repo=${encodeURIComponent(
				typeof repo === "string" ? repo : repo.repository.rootUri.toString(),
			)}`,
		});
	}

	constructor(private repositoryManager: RepositoryManager) {}

	async provideTextDocumentContent(
		uri: vscode.Uri,
		token: vscode.CancellationToken,
	): Promise<string> {
		const ref = uri.authority;
		if (!ref) return "";

		const repo = only(qs.parse(uri.query)["repo"]!);
		const path = uri.path.slice(1);

		const git = (await this.repositoryManager.repositories.read())[repo!]!;

		const contents = await git.showFile(ref, "./" + path);

		return contents;
	}
}
