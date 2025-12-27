import { Popover } from "@base-ui/react/popover";
import {
	ComponentProps,
	MutableRefObject,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { LaunchpadInput } from ".";
import { GitRef, GitRefFullname } from "../../../../../universal/git";
import { Resource } from "../../../../state/Resource";
import { toGraphBadgeList } from "../../../../state/toGraphBadges";
import { TypedEventTarget } from "../../../../state/TypedEventTarget";
import { useDerivedState } from "../../../../useDerivedState";
import { IPrimaryLaunchpadContext, LaunchpadEventTarget } from "./context";
import { BadgeItem, GroupedItems, GroupItem } from "./types";

export const useLaunchpadState = ({
	refs,
	activeRefFullNames,
	setActiveRefFullNames,
	...options
}: {
	refs: Resource<GitRef[]>;
	activeRefFullNames: GitRefFullname[] | undefined;
	setActiveRefFullNames: (value: GitRefFullname[]) => void;
	launchpadInputRef: MutableRefObject<LaunchpadInput | undefined>;
}) => {
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");

	const items = useMemo(() => getItems(refs), [refs]);

	const [selected, setSelected] = useDerivedState<GitRefFullname[]>(
		() => (activeRefFullNames ? [...activeRefFullNames] : []),
		[activeRefFullNames],
	);

	const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(
		undefined,
	);
	const target = useRef<LaunchpadEventTarget>(new TypedEventTarget());
	const inputRef = useRef<HTMLInputElement>(null!);

	useEffect(() => {
		const t = target.current;
		const h1 = t.addEventListener("highlightItem", ({ detail }) => {
			if (items.byId?.[detail]) {
				setHighlightedIndex(items.byId[detail].i);
				t.dispatch("highlight", items.byId[detail].itm.id);
			}
		});
		const h2 = t.addEventListener("toggleSelect", ({ detail }) => {
			if (items.byId?.[detail]) {
				setSelected((s) => {
					const value = s.includes(detail)
						? s.filter((x) => x !== detail)
						: [...s, detail];
					target.current.dispatch("selected", value);
					return value;
				});
			}
		});

		return () => {
			t.removeEventListener("highlightItem", h1);
			t.removeEventListener("toggleSelect", h2);
		};
	}, [items.byId, setSelected]);

	const activeItems = useMemo(
		() =>
			(input === ""
				? items.items
				: items.items?.filter(
						(itm) => itm.type === "search" || itm.label.includes(input),
				  )) ?? [],
		[input, items.items],
	);

	const context = useMemo(
		() =>
			({
				input,
				selected:
					(items.byId && selected.map((s) => items.byId?.[s]!.itm)) ?? [],
				clearSelected: selected.length
					? () => {
							void setActiveRefFullNames([]);
					  }
					: undefined,
			}) satisfies IPrimaryLaunchpadContext,
		[input, items.byId, selected, setActiveRefFullNames],
	);

	useImperativeHandle(options.launchpadInputRef, () => ({
		focus: () => inputRef.current?.focus(),
	}));

	useEffect(() => {
		// FIXME: use something else than setTimeout
		setTimeout(() => {
			target.current.dispatch("highlight", undefined);
			target.current.dispatch("selected", selected);
		}, 10);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	return {
		popoverRootProps: {
			open,
		} satisfies ComponentProps<typeof Popover.Root>,
		input,
		inputRef,
		containerProps: {
			onClick: () => inputRef.current?.focus(),
			onMouseDown: (e) => e.preventDefault(),
		} satisfies ComponentProps<"input">,
		inputProps: {
			value: input,
			ref: inputRef,
			onChange: (e) => {
				setInput(e.target.value);
				setHighlightedIndex(undefined);
				target.current.dispatch("highlight", undefined);
			},
			onKeyDown: (e) => {
				switch (e.key) {
					case "Escape": {
						e.preventDefault();
						inputRef.current.blur();

						break;
					}
					case "ArrowUp": {
						e.preventDefault();
						const index = (highlightedIndex ?? 0) - 1;
						setHighlightedIndex(index);
						target.current.dispatch(
							"highlight",
							getItemAt(activeItems, index)?.id,
						);

						break;
					}
					case "ArrowDown": {
						e.preventDefault();
						const index = (highlightedIndex ?? -1) + 1;
						setHighlightedIndex(index);
						target.current.dispatch(
							"highlight",
							getItemAt(activeItems, index)?.id,
						);
						break;
					}
					case " ": {
						e.preventDefault();

						if (highlightedIndex === undefined) break;

						const id = getItemAt(activeItems, highlightedIndex)?.id;

						if (id === undefined || id === "search") break;

						setSelected((s) => {
							const value = s.includes(id)
								? s.filter((x) => x !== id)
								: [...s, id];
							target.current.dispatch("selected", value);
							void setActiveRefFullNames(value);
							return value;
						});
						break;
					}
					case "Enter": {
						e.preventDefault();

						setInput("");

						void setActiveRefFullNames(selected);

						inputRef.current.blur();

						break;
					}
					case "Backspace": {
						if (input === "") {
							e.preventDefault();
							setSelected((s) => {
								const value = s.slice(0, -1);
								target.current.dispatch("selected", value);
								void setActiveRefFullNames(value);
								return value;
							});
						}
					}
					default:
						// noop
						break;
				}
			},
			onFocus: () => {
				setOpen(true);
				setHighlightedIndex(undefined);
			},
			onBlur: () => {
				setOpen(false);
			},
		} satisfies ComponentProps<"input">,
		context,
		target,
		activeItems,
		groupedUnfiltered: items.grouped,
	};
};

const getItems = (_refs: Resource<GitRef[]>) => {
	if (_refs.state !== "ready") return { grouped: undefined, items: undefined };

	const refs = _refs.value;

	const badges = toGraphBadgeList(refs);

	const local: GroupItem = {
		value: "Local",
		category: `local`,
		items: [
			{
				id: "ogg/categories/local",
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
						id: `ogg/categories/remotes/${r}`,
						type: "category",
						category: `remote-${r}`,
						label: `${r} remote`,
					},
					...remoteItems.map((b) => ({
						...b,
						category: `remote-${r}` as const,
					})),
				] satisfies BadgeItem[],
			} satisfies GroupItem,
		]),
	);

	const tags: GroupItem = {
		value: "Tags",
		category: `tags`,
		items: [
			{
				id: "ogg/categories/tags",
				type: "category",
				category: "tags",
				label: "tags",
			},
			...badges.tags.map((b) => ({ ...b, category: `tags` as const })),
		],
	};

	const all = [local, ...Object.values(remotes), tags];

	const items = all.flatMap((itm) => itm.items);

	return {
		byId: Object.fromEntries(items.map((itm, i) => [itm.id, { itm, i }])),
		items,
		grouped: { local, remotes, tags } satisfies GroupedItems,
	};
};

// Remainder which for works even for arbitrary-big negative numbers (-3 % 5 => 2 or -312 % 5 => 3)
export const remainder = (divisor: number, divider: number) =>
	((divisor % divider) + divider) % divider;

const getItemAt = <T>(items: T[], index: number) =>
	items[remainder(index ?? 0, items.length)];
