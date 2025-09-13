import * as vscode from "vscode";
import { OptionPickerItem, showOptionPicker } from "../../showOptionPicker";

interface CommandBuilderOptions<TFlag extends string, TOther extends string> {
	title?: string;
	getPlaceholder: (flags: string[], other: string[]) => string;
	canSelectMany?: boolean;

	flags: Omit<CommandBuilderItem<TFlag>, "type">[];
	other: Omit<CommandBuilderItem<TOther>, "type">[];
}

interface CommandBuilderItem<T extends string> extends OptionPickerItem {
	label: T;
	type: "flag" | "other";
}

export const showCommandBuilder = async <
	TFlag extends string,
	TOther extends string,
>({
	title,
	getPlaceholder,
	canSelectMany,
	flags,
	other,
}: CommandBuilderOptions<TFlag, TOther>) =>
	await showOptionPicker<CommandBuilderItem<TFlag | TOther>>({
		getTitle: () => title ?? "Execute command",
		getPlaceholder: (items) => {
			const flags = items.filter((i) => i.type !== "other").map((i) => i.label);
			const other = items.filter((i) => i.type === "other").map((i) => i.label);

			return getPlaceholder(flags, other);
		},
		canSelectMany,
		items: [
			...flags.map((f) => ({ ...f, type: "flag" as const })),
			{
				label: "Other options" as never,
				kind: vscode.QuickPickItemKind.Separator,
				type: "other",
			},
			...other.map((f) => ({ ...f, type: "other" as const })),
		],
	});
