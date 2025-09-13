import { showOptionPicker } from "../../showOptionPicker";
import { DeleteBranchOptions } from "../git/commands/gitBranchDelete";

export const getDeleteBranchOptions = async (): Promise<
	DeleteBranchOptions | undefined
> => {
	const selected = await showOptionPicker({
		items: [
			{
				label: "--force",
				description: "Delete branch even if it can lead to lost commits",
			},
			{
				label: "--remotes",
				description: "Delete remote tracking branches as well.",
			},
		] as const,
		getTitle: () => "Execute command",
		getPlaceholder: (items) =>
			`git cherry-pick ${items.map((i) => i.label).join(" ")}`,
	});

	if (selected === undefined) return;

	const selectedKeys = selected.map((s) => s.label);

	return {
		force: selectedKeys.includes("--force"),
		remotes: selectedKeys.includes("--remotes"),
	};
};
