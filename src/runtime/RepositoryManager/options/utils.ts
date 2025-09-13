import * as vscode from "vscode";
import { OptionPickerItem, showOptionPicker } from "../../showOptionPicker";

interface CommandBuilderOptions<TOptions extends Record<string, boolean>> {
	title?: string;
	getPlaceholder: (flags: string[], other: string[]) => string;
	canSelectMany?: boolean;

	initialValue: Partial<TOptions>;

	items: {
		[K in keyof TOptions]: CommandBuilderItem;
	};
}

interface CommandBuilderItem extends OptionPickerItem {
	type: "flag" | "other";
}

export const showCommandBuilder = async <
	TOptions extends Record<string, boolean>,
>({
	title,
	getPlaceholder,
	canSelectMany,
	initialValue,
	items,
}: CommandBuilderOptions<TOptions>) => {
	const withSelected = Object.entries(items).map(([k, itm]) => ({
		...itm,
		selected: initialValue[k] || false,
	}));

	const flags = withSelected.filter((itm) => itm.type === "flag");
	const other = withSelected.filter((itm) => itm.type === "other");

	const result = await showOptionPicker<CommandBuilderItem>({
		getTitle: () => title ?? "Execute command",
		getPlaceholder: (items) => {
			const flags = items.filter((i) => i.type === "flag").map((i) => i.label);
			const other = items.filter((i) => i.type === "other").map((i) => i.label);

			return getPlaceholder(flags, other);
		},
		canSelectMany,
		items: [
			...flags,
			{
				label: "Other options" as never,
				kind: vscode.QuickPickItemKind.Separator,
				type: "other",
			},
			...other,
		],
	});

	if (!result) return;

	const resultLabels = result.map((itm) => itm.label);

	return Object.fromEntries(
		Object.entries(items).map(([k, item]) => [
			k,
			resultLabels.includes(item.label),
		]),
	);
};
