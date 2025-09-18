import { isCommitMenuContext } from "../../universal/menuContext/commit";
import { command } from "../utils";

export const cherryPickCommand = command({
	id: "open-git-graph.cherry-pick",
	command: (backend) => async (ctx) => {
		if (!isCommitMenuContext(ctx)) throw new Error("Invalid argument");

		const repo = await backend.repositoryManager.getRepository(ctx.repo);

		if (!repo) throw new Error("Repo not found");

		const handle = backend.repositoryManager.getStateHandle(repo);

		await handle.cherryPick(ctx.hash);
	},
});
