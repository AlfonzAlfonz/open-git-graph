import * as vscode from "vscode";
import { showOptionPicker } from "../../showOptionPicker";
import { DeleteBranchOptions } from "../git/commands/gitBranchDelete";

export const getDeleteBranchOptions = async (
	branch: string,
): Promise<(DeleteBranchOptions & { remotes: boolean }) | undefined> => {
	const selected = await showOptionPicker({
		items: [
			{
				label: "--force",
				description: "Delete branch even if it can lead to lost commits",
			},
			{ label: "Other options", kind: vscode.QuickPickItemKind.Separator },
			{
				label: "Remove tracking branches",
				type: "other",
				detail: "Run `git push -d` to remove tracking branches",
			},
		] as const,
		getTitle: () => "Execute command",
		getPlaceholder: (items) =>
			`git branch -d ${items
				.filter((i) => i.type !== "other")
				.map((i) => i.label)
				.join(" ")} ${branch}`,
	});

	if (selected === undefined) return;

	const selectedKeys = selected.map((s) => s.label);

	return {
		force: selectedKeys.includes("--force"),
		remotes: selectedKeys.includes("Remove tracking branches"),
	};
};
