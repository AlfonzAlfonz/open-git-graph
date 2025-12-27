import {
	GitRef,
	GitRefBranch,
	GitRefFullname,
	GitRefTag,
} from "../../universal/git";

export type GraphBadge = {
	label: string;
	type: GitRef["type"];
	endDecorators?: string[];
	remoteOnlyBranch?: true;
};

export function* toGraphBadges(refs: Iterable<[string, GitRef[]]>) {
	for (const [k, v] of refs) {
		const badges: GraphBadge[] = [];
		const branches = new Map<string, [local: boolean, remotes: string[]]>();

		for (const r of v) {
			if (r.type === "tag") badges.push({ type: "tag", label: r.name });
			if (r.type === "head") badges.push({ type: "head", label: "HEAD" });
			if (r.type === "stash") badges.push({ type: "stash", label: "stash" });
			if (r.type === "branch") {
				const prev = branches.get(r.name);

				const isLocal = !!prev?.[0] || !r.remote;
				const remotes = [...(prev?.[1] ?? []), ...(r.remote ? [r.remote] : [])];

				branches.set(r.name, [isLocal, remotes]);
			}
		}

		for (const [branchName, [local, origins]] of branches) {
			if (local) {
				badges.push({
					type: "branch",
					label: branchName,
					endDecorators: origins,
				});
			} else {
				for (const origin of origins) {
					badges.push({
						type: "branch",
						label: `${origin}/${branchName}`,
						remoteOnlyBranch: true,
					});
				}
			}
		}

		badges.sort((a, b) => a.type.localeCompare(b.type)); // branches should go before tags

		yield [k, badges] as [string, GraphBadge[]];
	}
}

export type ListGraphBadge = {
	id: GitRefFullname;

	type: GitRef["type"];
	label: string;
	remote?: string;

	ref: GitRefBranch | GitRefTag;
};

export function toGraphBadgeList(refs: GitRef[]) {
	const local: ListGraphBadge[] = [];
	const remotes: Record<string, ListGraphBadge[]> = {};
	const tags: ListGraphBadge[] = [];

	for (const r of refs) {
		if (r.type === "head" || r.type === "stash") continue;

		const name = "remote" in r && r.remote ? `${r.remote}/${r.name}` : r.name;

		const badge = {
			id: r.fullname,
			type: r.type,
			label: name,
			remote: "remote" in r ? r.remote : undefined,
			ref: r,
		};

		if (r.type === "tag") {
			tags.push(badge);
		} else {
			if (r.remote) {
				remotes[r.remote] ??= [];
				remotes[r.remote]!.push(badge);
			} else {
				local.push(badge);
			}
		}
	}

	return {
		local,
		remotes,
		tags,
	};
}
