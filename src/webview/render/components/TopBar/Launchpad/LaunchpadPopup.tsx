import { Popover } from "@base-ui/react/popover";
import {
	LegacyRef,
	memo,
	MouseEvent,
	MutableRefObject,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { GitRefFullname } from "../../../../../universal/git";
import { TypedEvent } from "../../../../state/TypedEventTarget";
import { Checkbox } from "../../Checkbox";
import { TargetLaunchpadContext } from "./context";
import { BadgeItem, CategoryType, GroupedItems } from "./types";

const InternalLaunchpadPopup = ({
	activeItems,
	groupsUnfiltered,
}: {
	activeItems: BadgeItem[];
	groupsUnfiltered: GroupedItems | undefined;
}) => {
	const popupRef = useRef<HTMLDivElement>(null!);
	const groupLabelsRef = useRef<Partial<Record<CategoryType, HTMLDivElement>>>(
		{},
	);

	const scrollToGroup = (category: CategoryType) => (e: MouseEvent) => {
		e.preventDefault();

		const offset = groupLabelsRef.current[category]?.offsetTop;
		if (offset !== undefined) {
			popupRef.current.scrollTo(0, offset);
		}
	};

	return (
		<Popover.Popup
			ref={popupRef}
			initialFocus={false}
			finalFocus={false}
			className="launchpad-popup w-[var(--anchor-width)] h-[32rem] max-h-[min(var(--available-height),32rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none"
			onMouseDown={(e) => {
				e.preventDefault();
			}}
		>
			<div className="flex flex-row min-h-full">
				<div className="flex flex-col tab-container">
					<div className="sticky top-0">
						{[
							groupsUnfiltered?.local,
							...Object.values(groupsUnfiltered?.remotes ?? {}),
							groupsUnfiltered?.tags,
						].map(
							(group) =>
								group && (
									<div
										key={group.category}
										className={`tab`}
										tabIndex={-1}
										onClick={scrollToGroup(group.category)}
									>
										{group.value}
									</div>
								),
						)}
					</div>
				</div>
				<div className="flex flex-1 flex-col text-[11px]">
					{activeItems.map((itm) => (
						<LaunchpadOption
							key={itm.id}
							item={itm}
							ref={(el) =>
								itm.type === "category" &&
								(groupLabelsRef.current[itm.category] = el ?? undefined)
							}
							popupRef={popupRef}
						/>
					))}
				</div>
			</div>
		</Popover.Popup>
	);
};

export const LaunchpadPopup = memo(InternalLaunchpadPopup);

const LaunchpadOption = ({
	item,
	ref,
}: {
	item: BadgeItem;
	ref?: LegacyRef<HTMLDivElement>;
	popupRef: MutableRefObject<HTMLDivElement>;
}) => {
	const target = useContext(TargetLaunchpadContext);
	const elRef = useRef<HTMLDivElement>(null);
	const [highlighted, setHighlighted] = useState(false);
	const [selected, setSelected] = useState(false);

	useEffect(() => {
		const hl = (
			e:
				| TypedEvent<"highlight", string | undefined>
				| TypedEvent<"selected", GitRefFullname[]>,
		) => {
			if (e.type === "highlight") {
				if (item.id === e.detail) {
					setHighlighted(true);
					elRef.current?.scrollIntoView({ block: "nearest" });
				} else {
					setHighlighted(false);
				}
			} else {
				setSelected(e.detail.includes(item.id as GitRefFullname));
			}
		};

		target.addEventListener("highlight", hl);
		target.addEventListener("selected", hl);
		return () => {
			target.removeEventListener("highlight", hl);
			target.removeEventListener("selected", hl);
		};
	}, [highlighted, item.id, target]);

	if (item.type === "search") {
		return (
			<div
				className={`item ${highlighted ? "hl" : ""}`}
				onMouseEnter={() => target.dispatch("highlightItem", item.id)}
				// onClick={() => target.dispatch("toggleSelect", item.id)}
				ref={elRef}
			>
				<div className="flex items-center text-base">
					<span className="codicon codicon-search text-sm" /> Search for " xxx"
				</div>
			</div>
		);
	}

	if (item.type === "category") {
		return (
			<>
				<div ref={ref} />
				<div
					className={`group-label pinned ${highlighted ? "hl" : ""}`}
					onMouseEnter={() => target.dispatch("highlightItem", item.id)}
					onClick={() => target.dispatch("toggleSelect", item.id)}
				>
					<Checkbox readOnly checked={selected} />
					{item.label}
				</div>
			</>
		);
	}

	return (
		<div
			className={`item ${highlighted ? "hl" : ""}`}
			onMouseEnter={() => target.dispatch("highlightItem", item.id)}
			onClick={() => target.dispatch("toggleSelect", item.id)}
			ref={elRef}
		>
			<Checkbox readOnly checked={selected} />
			<span
				className={`codicon ${
					item.type === "tag"
						? "codicon-tag"
						: item.type === "branch"
						? "codicon-git-branch"
						: "codicon-question"
				}`}
			/>{" "}
			{item.label}
		</div>
	);
};
