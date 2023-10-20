import { command } from "../utils";

export const checkoutCommand = command({
	id: "open-git-graph.checkout",
	command:
		(_, s) =>
		async ({ repo, branch }: { repo?: string; branch?: string } = {}) => {
			if (!repo) throw new Error("Missing repository path");
			if (!branch) throw new Error("Missing branch");
			const store = s.ensure();

			const git = store.getGitRepository(repo);
			await git.checkout(branch);

			for (const [_, { repoPath, bridge }] of store.getState().panels) {
				if (repo !== repoPath) continue;
				await bridge.refresh();
			}
		},
});
