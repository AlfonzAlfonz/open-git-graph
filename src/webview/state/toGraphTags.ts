import { GitRef } from "../../universal/git";

export type GraphTag = {
	label: string;
	type: GitRef["type"];
	endDecorators?: string[];
	remoteOnlyBranch?: true;
};

export function* toGraphTags(refs: Iterable<[string, GitRef[]]>) {
	for (const [k, v] of refs) {
		const tags: GraphTag[] = [];
		const branches = new Map<string, [local: boolean, remotes: string[]]>();

		for (const r of v) {
			if (r.type === "tag") tags.push({ type: "tag", label: r.name });
			if (r.type === "head") tags.push({ type: "head", label: "HEAD" });
			if (r.type === "stash") tags.push({ type: "stash", label: "stash" });
			if (r.type === "branch") {
				const prev = branches.get(r.name);

				const isLocal = !!prev?.[0] || !r.remote;
				const remotes = [...(prev?.[1] ?? []), ...(r.remote ? [r.remote] : [])];

				branches.set(r.name, [isLocal, remotes]);
			}
		}

		for (const [branchName, [local, origins]] of branches) {
			if (local) {
				tags.push({
					type: "branch",
					label: branchName,
					endDecorators: origins,
				});
			} else {
				for (const origin of origins) {
					tags.push({
						type: "branch",
						label: `${origin}/${branchName}`,
						remoteOnlyBranch: true,
					});
				}
			}
		}

		tags.sort((a, b) => a.type.localeCompare(b.type)); // branches should go before tags

		yield [k, tags] as [string, GraphTag[]];
	}
}
