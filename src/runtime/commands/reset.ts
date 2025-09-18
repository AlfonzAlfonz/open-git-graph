import { isCommitMenuContext } from "../../universal/menuContext/commit";
import { command } from "../utils";

export const resetCommand = command({
	id: "open-git-graph.reset",
	command: (backend) => async (ctx: unknown) => {
		if (!isCommitMenuContext(ctx)) {
			throw new Error("Invalid argument");
		}

		const repo = await backend.repositoryManager.getRepository(ctx.repo);

		if (!repo) {
			throw new Error("Repo not found");
		}

		const handle = backend.repositoryManager.getStateHandle(repo);

		await handle.reset(ctx.hash);
	},
});
