import { command } from "../utils";

export const deleteBranchCommand = command({
	id: "open-git-graph.delete-branch",
	command: (backend) => async (ctx: unknown) => {
		if (!isValidCtx(ctx)) {
			throw new Error("Invalid argument");
		}

		const repo = await backend.repositoryManager.getRepository(ctx.repo);

		if (!repo) {
			throw new Error("Repo not found");
		}

		const handle = backend.repositoryManager.getStateHandle(repo);

		await handle.deleteBranch(ctx.branch, ctx.remotes ?? []);
	},
});

const isValidCtx = (
	x: unknown,
): x is { branch: string; repo: string; remotes?: string[] } =>
	!!x &&
	typeof x === "object" &&
	"branch" in x &&
	typeof x.branch === "string" &&
	"repo" in x &&
	typeof x.repo === "string" &&
	("remotes" in x ? Array.isArray(x.remotes) : true);
