import { isStashMenuContext } from "../../universal/menuContext/stash";
import { command } from "../utils";

export const stashApplyCommand = command({
	id: "open-git-graph.stash-apply",
	command: (backend) => async (ctx: unknown) => {
		if (!isStashMenuContext(ctx)) {
			throw new Error("Invalid argument");
		}

		const repo = await backend.repositoryManager.getRepository(ctx.repo);

		if (!repo) {
			throw new Error("Repo not found");
		}

		const handle = backend.repositoryManager.getStateHandle(repo);

		await handle.stashApply(ctx.reflogSelector);
	},
});
