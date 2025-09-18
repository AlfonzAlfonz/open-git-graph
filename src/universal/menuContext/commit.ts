export type CommitMenuContext = {
	webviewSection?: "commit";
	preventDefaultContextMenuItems?: true;
	repo: string;
	hash: string;
};

export const commitMenuContext = ({
	repo,
	hash,
}: {
	repo: string;
	hash: string;
}): CommitMenuContext => ({
	webviewSection: "commit",
	preventDefaultContextMenuItems: true,
	repo,
	hash,
});

export const isCommitMenuContext = (x: unknown): x is CommitMenuContext =>
	!!x &&
	typeof x === "object" &&
	"repo" in x &&
	typeof x.repo === "string" &&
	"hash" in x &&
	typeof x.hash === "string";
