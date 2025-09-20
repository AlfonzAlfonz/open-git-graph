import { useMemo } from "react";
import { toGraphBadgeList } from "../../../../state/toGraphBadges";
import { GitRef } from "../../../../../universal/git";
import { BadgeItem, GroupItem } from "./types";

export const useLaunchpadItems = (
	searchInput: string,
	refs: GitRef[] | undefined,
) => {
	const base = useMemo(() => {
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

	return useMemo(
		() => ({
			items: base.items && [
				{
					value: "search",
					category: "search",
					items: [
						{
							id: "search",
							type: "search",
							category: undefined,
							ref: undefined,
							value: searchInput,
						},
					],
				} satisfies GroupItem,
				...base.items,
			],
			grouped: base.grouped,
		}),
		[base, searchInput],
	);
};
