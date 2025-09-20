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
			id: string;
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
