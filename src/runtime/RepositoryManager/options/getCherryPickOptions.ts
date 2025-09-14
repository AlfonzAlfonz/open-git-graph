import { showOptionPicker } from "../../showOptionPicker";
import { CherryPickOptions } from "../git/commands/gitCherryPick";

export const getCherryPickOptions = async (): Promise<
	CherryPickOptions | undefined
> => {
	const selected = await showOptionPicker({
		items: [
			{
				label: "--no-commit",
				description: "Apply changes, but do not commit.",
			},
			{ label: "-x", description: "Record origin commit of the cherry pick." },
			{
				label: "--edit",
				description: "Edit commit message before committing.",
			},
		] as const,
		getTitle: () => "Execute command",
		getPlaceholder: (items) =>
			`git cherry-pick ${items.map((i) => i.label).join(" ")}`,
	});

	if (selected === undefined) return;

	const selectedKeys = selected.map((s) => s.label);

	return {
		noCommit: selectedKeys.includes("--no-commit"),
		recordOrigin: selectedKeys.includes("-x"),
		edit: selectedKeys.includes("--edit"),
	};
};
