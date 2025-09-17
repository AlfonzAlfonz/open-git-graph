import { EjectedPromise } from "@alfonz/async/EjectedPromise";
import * as vscode from "vscode";

interface OptionPickerOptions<T extends OptionPickerItem> {
	getTitle?: (selected: readonly ItemWithState<T>[]) => string;
	getPlaceholder?: (selected: readonly ItemWithState<T>[]) => string;
	canSelectMany?: boolean;

	items: readonly Omit<T & { selected?: boolean }, "id">[];
}

export interface OptionPickerItem extends vscode.QuickPickItem {
	radioGroup?: string;
	input?: boolean;
	initialValue?: string;
}

export type ItemWithState<T> = T & {
	id: number;
	value?: string;
};

export const showOptionPicker = <T extends OptionPickerItem>({
	canSelectMany,
	...options
}: OptionPickerOptions<T>) => {
	const pick = vscode.window.createQuickPick<T & { id: number }>();

	let active = true;
	let ignoreSelectionEvents = false;
	const result = EjectedPromise.create<readonly T[] | undefined>();

	const state = createOptionsPickerState(options);

	function applyState(wasHidden?: boolean) {
		const s = state.getState();

		({ title: pick.title, placeholder: pick.placeholder } = s);

		if (!pick.items.length || wasHidden) pick.items = s.items;

		pick.selectedItems = s.selectedItems;
	}

	applyState();

	pick.canSelectMany =
		canSelectMany !== undefined ? canSelectMany : !!options.items.length;

	pick.show();

	pick.onDidChangeSelection(async (s) => {
		if (ignoreSelectionEvents) return;

		ignoreSelectionEvents = true;
		pick.enabled = false;
		active = false;
		try {
			const wasHidden = await state.select(s);
			applyState(wasHidden);
			if (wasHidden) pick.show();
		} finally {
			// TODO: do not use setTimeout
			setTimeout(() => {
				ignoreSelectionEvents = false;
			}, 20);
			pick.enabled = true;
			active = true;
		}
	});

	pick.onDidAccept(() => {
		result.resolve(state.getState().selectedWithValue);
		pick.hide();
	});

	pick.onDidHide(() => {
		if (active) {
			result.resolve(undefined);
		}
	});

	return result.promise;
};

export const createOptionsPickerState = <T extends OptionPickerItem>(
	options: OptionPickerOptions<T>,
) => {
	const originalItemsMap = new Map(
		options.items.map((item, i) => [i, { ...item, id: i }]),
	);
	const originalItems = [...originalItemsMap.values()];

	const inputs = new Map<number, string | undefined>(
		originalItems
			.filter((itm) => itm.input)
			.map((itm) => [itm.id, itm.initialValue]),
	);

	const items = originalItems.map(
		({ selected: _, ...itm }) => ({ ...itm }) as ItemWithState<T>,
	);

	let selected = getSelectedState(
		originalItems
			.filter((itm) => itm.selected)
			.map(({ selected: _, ...itm }) => itm as ItemWithState<T>),
	);

	return {
		getState() {
			for (const itm of items) {
				const original = originalItemsMap.get(itm.id)!;
				const input = inputs.get(itm.id);
				itm.label = original.label + (input !== undefined ? ` "${input}"` : "");
			}

			const selectedWithValue = selected.items.map((itm) => ({
				...itm,
				value: inputs.get(itm.id),
			}));

			return {
				items: items as (T & { id: number })[],
				selectedItems: items.filter((itm) =>
					selected.ids.includes(itm.id),
				) as (T & { id: number })[],
				selectedWithValue,
				title: options.getTitle?.(selectedWithValue),
				placeholder: options.getPlaceholder?.(selectedWithValue),
			};
		},
		async select(selection: readonly (T & { id: number })[]) {
			let wasHidden = false;

			let selectedItems = selection;
			const delta = selection.filter((itm) => !selected.ids.includes(itm.id));

			for (const selectedItem of delta) {
				if (selectedItem?.radioGroup) {
					for (const s of selectedItems) {
						if (
							s.radioGroup !== selectedItem.radioGroup ||
							s.id === selectedItem.id
						)
							continue;
						inputs.delete(s.id);
					}
					selectedItems = selectedItems.filter(
						(s) =>
							s.radioGroup !== selectedItem.radioGroup ||
							s.id === selectedItem.id,
					);
				}

				if (selectedItem?.input) {
					wasHidden = true;
					const input = await vscode.window.showInputBox({
						placeHolder: selectedItem.label,
					});

					if (input !== undefined) {
						inputs.set(selectedItem.id, input);
					} else {
						selectedItems = selectedItems.filter(
							(s) => s.id !== selectedItem.id,
						);
					}
				}
			}

			selected = getSelectedState(selectedItems);

			return wasHidden;
		},
	};
};

const getSelectedState = <T extends { id: unknown }>(items: readonly T[]) => {
	return {
		items: items,
		ids: items.map((itm) => itm.id),
	};
};
