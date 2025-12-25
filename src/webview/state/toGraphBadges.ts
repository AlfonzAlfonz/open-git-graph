import { GitRef } from "../../universal/git";

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
