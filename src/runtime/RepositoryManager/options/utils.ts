import * as vscode from "vscode";
import { OptionPickerItem, showOptionPicker } from "../../showOptionPicker";

interface CommandBuilderOptions<T extends string> {
	title?: string;
	getPlaceholder: (flags: string[], other: string[]) => string;
	canSelectMany?: boolean;

	initialValue?: Partial<Record<T, boolean>>;

	items: Record<T, CommandBuilderItem>;
}

interface CommandBuilderItem extends OptionPickerItem {
	type: "flag" | "other";
}

export const showCommandBuilder = async <T extends string>({
	title,
	getPlaceholder,
	canSelectMany,
	initialValue,
	items,
}: CommandBuilderOptions<T>) => {
	const withSelected = Object.entries<CommandBuilderItem>(items).map(
		([k, itm]) => ({
			...itm,
			selected: initialValue?.[k as T] || false,
		}),
	);

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
		Object.entries<CommandBuilderItem>(items).map(([k, item]) => [
			k,
			resultLabels.includes(item.label),
		]),
	) as Record<T, boolean>;
};
