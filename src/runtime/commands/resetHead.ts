import * as vscode from "vscode";
import { GitRepository } from "../git/GitRepository";
import { handleWebviewMessage } from "../panel/handleWebviewMessage";
import { command } from "../utils";

export const resetHeadCommand = command({
	id: "open-git-graph.reset-head",
	command:
		(_, s) =>
		async ({ repo, ref }: { repo?: string; ref?: string } = {}) => {
			const store = s.ensure();

			if (!repo) {
				throw new Error("Missing repository path");
			}
			if (!ref) {
				throw new Error("Missing ref");
			}

			const git = new GitRepository(store.getState(), repo);
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

			for (const [panel, { repoPath }] of store.getState().panels) {
				if (repo !== repoPath) continue;
				await handleWebviewMessage(store, panel, { type: "INIT" });
			}
		},
});
