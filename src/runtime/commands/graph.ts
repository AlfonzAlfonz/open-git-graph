import * as vscode from "vscode";
import { GitRepository } from "../RepositoryManager/git/GitRepository";
import { errors } from "../handleError";
import { ensureLogger } from "../logger";
import { command } from "../utils";

export const graphCommand = command({
	id: "open-git-graph.graph",
	command: async (backend) => {
		const repositories = await backend.git.repositories.read();
		ensureLogger("zz").appendLine(Object.keys(repositories).join());
		const repo = await selectRepo(repositories);

		ensureLogger("graphCommand").appendLine(`Opening repo ${repo}`);

		backend.graphTab.open(repo);
	},
});

export const selectRepo = async (repos: Record<string, GitRepository>) => {
	const keys = Object.keys(repos);

	if (keys.length === 0) {
		throw errors.noRepo();
	}

	if (keys.length === 1) {
		return repos[keys[0]!]!;
	}

	const selected = await vscode.window.showQuickPick(keys);

	return selected ? repos[selected]! : repos[0]!;
};
