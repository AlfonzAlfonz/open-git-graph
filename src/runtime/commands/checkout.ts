import { command } from "../utils";

export const checkoutCommand = command({
	id: "open-git-graph.checkout",
	command: (backend) => async (ctx: unknown) => {
		if (!isValidCtx(ctx)) {
			throw new Error("Invalid argument");
		}

		const repo = await backend.repositoryManager.getRepository(ctx.repo);

		if (!repo) {
			throw new Error("Repo not found");
		}

		const handle = backend.repositoryManager.getStateHandle(repo);

		await handle.checkout(ctx.branch);
	},
});

const isValidCtx = (x: unknown): x is { branch: string; repo: string } =>
	!!x &&
	typeof x === "object" &&
	"branch" in x &&
	typeof x.branch === "string" &&
	"repo" in x &&
	typeof x.repo === "string";
