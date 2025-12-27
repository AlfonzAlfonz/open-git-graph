import { ListGraphBadge } from "../../../../state/toGraphBadges";

export type CategoryType = "local" | `remote-${string}` | "tags" | "search";

export type BadgeItem =
	| {
			id: "search";
			type: "search";
			category: undefined;
			ref: undefined;
			value: string;
	  }
	| (ListGraphBadge & { category: CategoryType })
	| {
			id: `ogg/categories/${string}`;
			type: "category";
			category: CategoryType;
			label: string;
	  };

export type GroupItem = {
	value: string;
	items: BadgeItem[];
	category: CategoryType;
};

export type GroupedItems = {
	local: GroupItem;
	remotes: Record<string, GroupItem>;
	tags: GroupItem;
};

export type BaseUIEvent<E extends React.SyntheticEvent<Element, Event>> = E & {
	preventBaseUIHandler: () => void;
	readonly baseUIHandlerPrevented?: boolean;
};
