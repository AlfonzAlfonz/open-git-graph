export type BranchMenuContext = {
	webviewSection: "branch" | "branch-remote";
	preventDefaultContextMenuItems: true;
	repo: string;
	branch: string;
	remotes?: string[];
};

export const branchMenuContext = (
	webviewSection: "branch" | "branch-remote",
	{ repo, branch }: Pick<BranchMenuContext, "branch" | "repo" | "remotes">,
): BranchMenuContext => ({
	webviewSection,
	preventDefaultContextMenuItems: true,
	repo,
	branch,
});

export const isBranchMenuContext = (x: unknown): x is BranchMenuContext =>
	!!x &&
	typeof x === "object" &&
	"repo" in x &&
	typeof x.repo === "string" &&
	"branch" in x &&
	typeof x.branch === "string" &&
	"remotes" in x
		? Array.isArray(x.remotes) && x.remotes.every((y) => typeof y === "string")
		: true;
