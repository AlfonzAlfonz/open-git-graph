import * as vscode from "vscode";

interface OptionPickerOptions<T extends OptionPickerItem> {
	getTitle?: (selected: readonly T[]) => string;
	getPlaceholder?: (selected: readonly T[]) => string;
	canSelectMany?: boolean;

	items: readonly (T & { selected?: boolean })[];
}

export interface OptionPickerItem extends vscode.QuickPickItem {
	radioGroup?: string;
}

export const showOptionPicker = <T extends OptionPickerItem>({
	getTitle,
	getPlaceholder,
	canSelectMany,
	items,
}: OptionPickerOptions<T>) => {
	const pick = vscode.window.createQuickPick<T & { id: number }>();

	pick.title = getTitle?.(pick.selectedItems);
	pick.placeholder = getPlaceholder?.(pick.selectedItems);

	const withIds = items.map((item, i) => ({ ...item, id: i }));
	pick.items = withIds;
	pick.selectedItems = withIds.filter((itm) => itm.selected);

	pick.canSelectMany =
		canSelectMany !== undefined ? canSelectMany : !!items.length;

	pick.show();

	let prevSelectedId: number[] = [];

	pick.onDidChangeSelection((s) => {
		const selectedItem = s.find((itm) => !prevSelectedId.includes(itm.id));

		if (selectedItem?.radioGroup) {
			pick.selectedItems = pick.selectedItems.filter(
				(s) =>
					s.radioGroup !== selectedItem.radioGroup || s.id === selectedItem.id,
			);
		}

		try {
			pick.title = getTitle?.(pick.selectedItems);
			pick.placeholder = getPlaceholder?.(pick.selectedItems);
		} finally {
			prevSelectedId = pick.selectedItems.map((i) => i.id);
		}
	});

	return new Promise<readonly T[] | undefined>((resolve) => {
		pick.onDidAccept(() => {
			resolve(pick.selectedItems);
			pick.hide();
		});
		pick.onDidHide(() => resolve(undefined));
	});
};
