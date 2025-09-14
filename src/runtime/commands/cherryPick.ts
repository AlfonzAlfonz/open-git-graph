import { command } from "../utils";

export const cherryPickCommand = command({
	id: "open-git-graph.cherry-pick",
	command: (backend) => async (ctx) => {
		if (!isValidCtx(ctx)) throw new Error("Invalid argument");

		const repo = await backend.repositoryManager.getRepository(ctx.repo);

		if (!repo) throw new Error("Repo not found");

		const handle = backend.repositoryManager.getStateHandle(repo);

		await handle.cherryPick(ctx.ref);
	},
});

const isValidCtx = (x: unknown): x is { ref: string; repo: string } =>
	!!x &&
	typeof x === "object" &&
	"ref" in x &&
	typeof x.ref === "string" &&
	"repo" in x &&
	typeof x.repo === "string";
