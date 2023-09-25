import * as vscode from "vscode";
import { command } from "../utils";
import { GitRepository } from "../git/GitRepository";

export const resetHeadCommand = command({
	id: "open-git-graph.reset-head",
	command:
		(_, store) =>
		async ({ repo, ref }: { repo?: string; ref?: string } = {}) => {
			console.log(repo, ref);
			if (!repo) {
				throw new Error("Missing repository path");
			}
			if (!ref) {
				throw new Error("Missing ref");
			}

			const git = new GitRepository(store.ensure().getState(), repo);
			const o = [
				{
					value: "soft",
					label: "Soft",
					description: "Keep all changes, but reset head",
				},
				{
					value: "mixed",
					label: "Mixed",
					description: "Keep working tree, but reset index",
				},
				{
					value: "hard",
					label: "Hard",
					description: "Discard all changes",
				},
			] as const;

			const answer = await vscode.window.showQuickPick(o, {
				title: "Reset mode",
			});

			if (answer) {
				await git.reset(ref, answer.value);
			}
		},
});
