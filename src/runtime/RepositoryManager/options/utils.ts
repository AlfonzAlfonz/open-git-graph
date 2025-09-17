import * as vscode from "vscode";
import {
	OptionPickerItem,
	ItemWithState,
	showOptionPicker,
} from "../../showOptionPicker";
import { GitCommand } from "../git/commands/utils";

interface CommandBuilderOptions<T extends Record<string, string | boolean>> {
	title?: string;
	getPlaceholder: (options: T) => string;
	canSelectMany?: boolean;

	initialValue?: Partial<T>;

	items: {
		[K in keyof T]: T[K] extends string
			? CommandBuilderItem<"input">
			: CommandBuilderItem<"flag" | "other">;
	};
}

interface CommandBuilderItem<
	TType extends "flag" | "input" | "other" = "flag" | "input" | "other",
> extends OptionPickerItem {
	type: TType;
}

type WithPropertyName<T extends CommandBuilderItem> = T & {
	property: string;
};

export const showCommandBuilder = async <
	T extends Record<string, string | boolean>,
>({
	title,
	getPlaceholder,
	canSelectMany,
	initialValue,
	items,
}: CommandBuilderOptions<T>): Promise<T | undefined> => {
	const initial = Object.entries(
		items as Record<string, WithPropertyName<CommandBuilderItem>>,
	).map(([k, itm]) => ({
		...itm,
		selected: !!initialValue?.[k] || false,
		property: k,
		initialValue:
			itm.type === "input"
				? (initialValue?.[k] as string | undefined)
				: undefined,
	}));

	const flags = initial
		.filter((itm) => itm.type === "flag" || itm.type === "input")
		.map((itm) => ({
			...itm,
			iconPath: new vscode.ThemeIcon(
				itm.type === "flag" ? "flag" : "symbol-key",
			),
			input: itm.input ?? itm.type === "input",
		}));
	const other = initial
		.filter((itm) => itm.type === "other")
		.map((itm) => ({
			...itm,
			iconPath: new vscode.ThemeIcon("symbol-method"),
		}));

	const getOptions = (
		selected: readonly ItemWithState<WithPropertyName<CommandBuilderItem>>[],
	) => {
		const selectedProps = selected.map((itm) => itm.property);
		return Object.fromEntries(
			initial.map(
				(item) =>
					[
						item.property,
						item.type === "input"
							? selectedProps.includes(item.property)
								? selected.find((s) => s.property === item.property)?.value
								: undefined
							: selectedProps.includes(item.property),
					] as const,
			),
		) as T;
	};

	const pickerItems = [
		...flags,
		{
			label: "Other options" as never,
			kind: vscode.QuickPickItemKind.Separator,
			type: "other",
			property: "---",
		},
		...other,
	] as const;

	const result = await showOptionPicker<WithPropertyName<CommandBuilderItem>>({
		getTitle: () => title ?? "Execute command",
		getPlaceholder: (items) => {
			return getPlaceholder(getOptions(items));
		},
		canSelectMany,
		items: pickerItems,
	});

	if (!result) return;

	return getOptions(result as any);
};

export const formatArgs = (command: GitCommand<unknown>) =>
	"git " + command.args.filter((a) => a !== null).join(" ");
