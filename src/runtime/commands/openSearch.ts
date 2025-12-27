import * as vscode from "vscode";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { command } from "../utils";

export const openSearchCommand = command({
	id: "open-git-graph.search",
	command: (backend) => async () => {
		backend.graphTab.openSearch();
	},
});

export const selectRepo = async (repos: Record<string, GitRepository>) => {
	const keys = Object.keys(repos);

	if (keys.length === 0) {
		throw new Error("Cannot execute git outside of a repository.");
	}

	if (keys.length === 1) {
		return repos[keys[0]!]!;
	}

	const selected = await vscode.window.showQuickPick(keys);

	return selected ? repos[selected]! : repos[0]!;
};
