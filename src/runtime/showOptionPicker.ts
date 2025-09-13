import * as vscode from "vscode";

interface OptionPickerOptions<T extends vscode.QuickPickItem> {
	getTitle?: (selected: readonly T[]) => string;
	getPlaceholder?: (selected: readonly T[]) => string;

	items: T[];
}

export const showOptionPicker = <T extends vscode.QuickPickItem>({
	getTitle,
	getPlaceholder,
	items,
}: OptionPickerOptions<T>) => {
	const pick = vscode.window.createQuickPick<T>();

	pick.title = getTitle?.(pick.selectedItems);
	pick.placeholder = getPlaceholder?.(pick.selectedItems);
	pick.items = items;
	pick.canSelectMany = true;

	pick.show();

	pick.onDidChangeSelection(() => {
		pick.title = getTitle?.(pick.selectedItems);
		pick.placeholder = getPlaceholder?.(pick.selectedItems);
	});

	return new Promise<readonly T[] | undefined>((resolve) => {
		pick.onDidAccept(() => {
			resolve(pick.selectedItems);
			pick.hide();
		});
		pick.onDidHide(() => resolve(undefined));
	});
};
