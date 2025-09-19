import { Combobox } from "@base-ui-components/react/combobox";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ListGraphBadge, toGraphBadgeList } from "../../../state/toGraphBadges";
import { useAppContext } from "../AppContext";
import { RefBadge } from "../RefBadge";
import { useBridgeMutation } from "../../useBridge/useBridgeMutation";
import { bridge } from "../../../bridge";
import { GitRef, GitRefBranch, GitRefTag } from "../../../../universal/git";

type CategoryType = "local" | `remote-${string}` | "tags";

type BadgeItem =
	| (ListGraphBadge & { category: CategoryType })
	| {
			id: string;
			type: "category";
			category: CategoryType;
			label: string;
	  };

type GroupItem = {
	value: string;
	items: BadgeItem[];
	category: CategoryType;
};

type GroupedItems = {
	local: GroupItem;
	remotes: Record<string, GroupItem>;
	tags: GroupItem;
};

export default function Launchpad() {
	const id = useId();
	const { refs } = useAppContext();

	const [setRefs] = useBridgeMutation((r: (GitRefBranch | GitRefTag)[]) =>
		bridge.setRefs(r),
	);

	const containerRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const popupRef = useRef<HTMLDivElement | null>(null);

	const groupLabelsRef = useRef<Partial<Record<CategoryType, HTMLDivElement>>>(
		{},
	);

	const [open, setOpen] = useState(false);

	const [selected, setSelected] = useState<BadgeItem[]>([]);

	const highlightedItem = useRef<BadgeItem>();

	const { grouped, items } = useMemo(() => {
		if (!refs) return { grouped: undefined, items: undefined };

		const badges = toGraphBadgeList(refs);

		const local: GroupItem = {
			value: "Local",
			category: `local`,
			items: [
				{
					id: "category:local",
					type: "category",
					category: "local",
					label: "local",
				},
				...badges.local.map((b) => ({ ...b, category: "local" as const })),
			],
		};

		const remotes = Object.fromEntries(
			Object.entries(badges.remotes).map(([r, remoteItems]) => [
				r,
				{
					value: r,
					category: `remote-${r}` as const,
					items: [
						{
							id: `category:remote-${r}`,
							type: "category",
							category: `remote-${r}`,
							label: `${r} remote`,
						},
						...remoteItems.map((b) => ({
							...b,
							category: `remote-${r}` as const,
						})),
					] satisfies BadgeItem[],
				},
			]),
		);

		const tags: GroupItem = {
			value: "Tags",
			category: `tags`,
			items: [
				{
					id: "category:tags",
					type: "category",
					category: "tags",
					label: "tags",
				},
				...badges.tags.map((b) => ({ ...b, category: `tags` as const })),
			],
		};

		return {
			items: [local, ...Object.values(remotes), tags],
			grouped: { local, remotes, tags },
		};
	}, [refs]);

	const onValueChange = (
		values: BadgeItem[] | ((s: BadgeItem[]) => BadgeItem[]),
	) => {
		setSelected((s) => {
			const badges = typeof values === "function" ? values(s) : values;

			if (badges.length === 0) {
				void setRefs([]);
				return [];
			}

			const addedItem = badges.find((b) => !s.includes(b));

			if (addedItem) {
				if (addedItem.type === "category") {
					// remove all non-category items from group and add category item
					return [
						...s.filter((b) => b.category !== addedItem.category),
						addedItem,
					];
				} else {
					const allIndex = s.findIndex(
						(b) => b.type === "category" && b.category === addedItem.category,
					);

					if (allIndex === -1) {
						// category item is not selected, just add the item
						return [...s, addedItem];
					} else {
						// category item is selected, unselect it and add every item from category except for the originally addItem

						const added = grouped
							? getGroup(grouped, addedItem)!.items.filter(
									(itm) => itm.type !== "category" && itm !== addedItem,
							  )
							: [];

						return [
							...s.filter(
								(b) =>
									!(b.type === "category" && b.category === addedItem.category),
							),
							...added,
						];
					}
				}
			}

			const removedItem = s.find((b) => !badges.includes(b));

			if (removedItem) {
				return s.filter((b) => b !== removedItem);
			}

			console.warn("Selected items didn't change");
			return s;
		});
	};

	const scrollToGroup = (category: CategoryType) => () => {
		const offset = groupLabelsRef.current[category]?.offsetTop;
		if (offset !== undefined) {
			popupRef.current?.scrollTo(0, offset);
		}
	};

	useEffect(() => {
		setSelected((s) => {
			const ids = new Set(s.map((x) => x.id));
			return (
				items?.flatMap((g) => g.items).filter((itm) => ids.has(itm.id)) ?? []
			);
		});
	}, [items]);

	return (
		<Combobox.Root
			items={items}
			multiple
			value={selected}
			onValueChange={onValueChange}
			onItemHighlighted={(itm) => {
				highlightedItem.current = itm;
			}}
			open={open}
			onOpenChange={() => inputRef.current?.focus()}
		>
			<div className="launchpad-wrapper">
				<div className="launchpad" ref={containerRef}>
					<Combobox.Chips
						className="input p-[8.5px] min-h-[35px] text-base"
						onClick={() => {
							inputRef.current?.focus();
							setOpen(true);
						}}
					>
						<Combobox.Value>
							{(value: BadgeItem[]) => (
								<>
									{value.map((badge, i) =>
										badge.type === "category" ? (
											<Combobox.Chip
												key={i}
												// aria-label={badge.label} // TODO
												className="flex items-center r-selected"
											>
												<RefBadge
													label={badge.label}
													type="category"
													endDecorators={[
														{
															label: (
																<Combobox.ChipRemove
																	aria-label="Remove"
																	className="flex items-center bg-transparent border-none outline-none color-inherit"
																>
																	<span className="codicon codicon-close text-sm" />
																</Combobox.ChipRemove>
															),
														},
													]}
												/>
											</Combobox.Chip>
										) : (
											<Combobox.Chip
												key={i}
												aria-label={badge.label}
												className="flex items-center r-selected"
											>
												<RefBadge
													label={badge.label}
													type={badge.type}
													endDecorators={[
														{
															label: (
																<Combobox.ChipRemove
																	aria-label="Remove"
																	className="flex items-center bg-transparent border-none outline-none color-inherit"
																>
																	<span className="codicon codicon-close text-sm" />
																</Combobox.ChipRemove>
															),
														},
													]}
												/>
											</Combobox.Chip>
										),
									)}

									<Combobox.Input
										id={id}
										className="min-w-12 h-[18px] flex-1 bg-transparent !border-none !outline-none color-inherit"
										placeholder="Filter..."
										ref={inputRef}
										onFocus={() => setOpen(true)}
										onBlur={() => {
											setOpen(false);
											if (!grouped) return;

											const newRefs = selected
												.flatMap((s) =>
													s.type === "category"
														? getGroup(grouped, s)!.items.filter(
																(
																	itm,
																): itm is BadgeItem & {
																	type: GitRef["type"];
																} => itm.type !== "category",
														  )
														: s,
												)
												.map((s) => s.ref);
											void setRefs(newRefs);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventBaseUIHandler();
												inputRef.current?.blur();
												setOpen(false);
											}
											if (e.key === " ") {
												e.preventBaseUIHandler();
												e.preventDefault();

												onValueChange((s) => {
													if (highlightedItem.current) {
														const exists = s.includes(highlightedItem.current);
														if (exists) {
															return s.filter(
																(itm) => itm !== highlightedItem.current,
															);
														} else {
															return [...(s ?? []), highlightedItem.current];
														}
													}
													return s;
												});
											}

											if (e.key === "Escape") {
												e.preventBaseUIHandler();
												inputRef.current?.blur();
												setOpen(false);
											}
										}}
									/>
								</>
							)}
						</Combobox.Value>
					</Combobox.Chips>
					<div className="controls flex items-center pr-2">
						<Combobox.Clear
							className="flex cursor-pointer h-10 w-6 items-center justify-center bg-transparent p-0 border-none text-inherit"
							aria-label="Clear selection"
						>
							<span className="codicon codicon-clear-all" />
						</Combobox.Clear>
					</div>
				</div>
			</div>

			<Combobox.Portal>
				<Combobox.Positioner
					className="outline-none"
					anchor={containerRef}
					sideOffset={1}
				>
					<Combobox.Popup
						ref={popupRef}
						className="launchpad-popup w-[var(--anchor-width)] h-[32rem] max-h-[min(var(--available-height),32rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none"
					>
						<div className="flex flex-row min-h-full">
							<div className="flex flex-col tab-container">
								<div className="sticky top-0">
									<div
										className={`tab`}
										tabIndex={-1}
										onClick={scrollToGroup("local")}
									>
										Local
									</div>

									{grouped &&
										Object.keys(grouped.remotes).map((r) => (
											<div
												className={`tab`}
												tabIndex={-1}
												onClick={scrollToGroup(`remote-${r}`)}
											>
												{r}
											</div>
										))}

									<div
										className={`tab`}
										tabIndex={-1}
										onClick={scrollToGroup("tags")}
									>
										Tags
									</div>
								</div>
							</div>
							<Combobox.List className="flex flex-1 flex-col text-[11px]">
								{(group: GroupItem) => (
									<div
										className="flex flex-col"
										ref={(el) =>
											(groupLabelsRef.current[group.category] = el ?? undefined)
										}
									>
										{group.items.map((item, i) =>
											item.type === "category" ? (
												<Combobox.Item
													key={i}
													value={item}
													className="group-label pinned"
													render={(props, state) => (
														<div {...props}>
															<input
																type="checkbox"
																checked={state.selected}
																readOnly
															/>
															{group.value}
														</div>
													)}
												/>
											) : (
												<Combobox.Item
													key={i}
													value={item}
													className={(s) =>
														(s.selected || selected.includes(group.items[0]!)
															? "r-selected"
															: "r-inactive") + " item"
													}
												>
													<RefBadge {...item} endDecorators={[]} />
												</Combobox.Item>
											),
										)}
									</div>
								)}
							</Combobox.List>
						</div>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	);
}

const getGroup = (grouped: GroupedItems, item: BadgeItem) => {
	if (item.category.startsWith("remote-")) {
		const name = item.category.slice("remote-".length);
		return grouped.remotes[name];
	}

	return grouped[item.category as "tags" | "local"]!;
};
