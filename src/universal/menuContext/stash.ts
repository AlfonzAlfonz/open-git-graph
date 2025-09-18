export type StashMenuContext = {
	webviewSection?: "stash";
	preventDefaultContextMenuItems?: true;
	repo: string;
	reflogSelector: string;
};

export const stashMenuContext = ({
	repo,
	reflogSelector,
}: {
	repo: string;
	reflogSelector: string;
}): StashMenuContext => ({
	webviewSection: "stash",
	preventDefaultContextMenuItems: true,
	repo,
	reflogSelector,
});

export const isStashMenuContext = (x: unknown): x is StashMenuContext =>
	!!x &&
	typeof x === "object" &&
	"repo" in x &&
	typeof x.repo === "string" &&
	"reflogSelector" in x &&
	typeof x.reflogSelector === "string";
