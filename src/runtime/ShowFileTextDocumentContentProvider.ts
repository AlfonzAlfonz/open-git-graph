import qs from "node:querystring";
import * as vscode from "vscode";
import { GitRepository } from "./git/GitRepository";
import { Lazy, RuntimeStore } from "./state/types";
import { only } from "./utils";
import { Repository } from "./vscode.git/types";

export class ShowFileTextDocumentContentProvider
	implements vscode.TextDocumentContentProvider
{
	public static scheme = "open-git-graph-showFile";

	public static createUri(
		ref: string | undefined,
		path: string,
		repo: string | Repository,
	) {
		return vscode.Uri.from({
			scheme: this.scheme,
			authority: ref,
			path: "/" + path,
			query: `repo=${encodeURIComponent(
				typeof repo === "string" ? repo : repo.rootUri.toString(),
			)}`,
		});
	}

	constructor(private store: Lazy<RuntimeStore>) {}

	async provideTextDocumentContent(
		uri: vscode.Uri,
		token: vscode.CancellationToken,
	): Promise<string> {
		const ref = uri.authority;
		if (!ref) return "";

		const repo = only(qs.parse(uri.query)["repo"]!);
		const path = uri.path.slice(1);

		const state = this.store.ensure().getState();

		const git = new GitRepository(state, state.repository[repo!]!);
		const contents = await git.showFile(ref, "./" + path);

		return contents;
	}
}
