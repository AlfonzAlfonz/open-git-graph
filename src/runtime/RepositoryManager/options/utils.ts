import * as vscode from "vscode";
import { OptionPickerItem, showOptionPicker } from "../../showOptionPicker";
import { GitCommand } from "../git/commands/utils";

interface CommandBuilderOptions<T extends string> {
	title?: string;
	getPlaceholder: (
		options: Record<T, boolean>,
		flags: string[],
		other: string[],
	) => string;
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

	const getOptions = (selected: readonly CommandBuilderItem[]) => {
		const labels = selected.map((itm) => itm.label);
		return Object.fromEntries(
			Object.entries<CommandBuilderItem>(items).map(([k, item]) => [
				k,
				labels.includes(item.label),
			]),
		) as Record<T, boolean>;
	};

	const result = await showOptionPicker<CommandBuilderItem>({
		getTitle: () => title ?? "Execute command",
		getPlaceholder: (items) => {
			const flags = items.filter((i) => i.type === "flag").map((i) => i.label);
			const other = items.filter((i) => i.type === "other").map((i) => i.label);

			return getPlaceholder(getOptions(items), flags, other);
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

	return getOptions(result);
};

export const formatArgs = (command: GitCommand<unknown>) =>
	"git " + command.args.filter((a) => a !== null).join(" ");
