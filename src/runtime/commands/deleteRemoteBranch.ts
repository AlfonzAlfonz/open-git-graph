import { isBranchMenuContext } from "../../universal/menuContext/branch";
import { command } from "../utils";

export const deleteRemoteBranchCommand = command({
	id: "open-git-graph.delete-remote-branch",
	command: (backend) => async (ctx: unknown) => {
		if (!isBranchMenuContext(ctx)) {
			throw new Error("Invalid argument");
		}

		const repo = await backend.repositoryManager.getRepository(ctx.repo);

		if (!repo) {
			throw new Error("Repo not found");
		}

		const handle = backend.repositoryManager.getStateHandle(repo);

		await handle.deleteRemoteBranches([ctx.branch]);
	},
});
