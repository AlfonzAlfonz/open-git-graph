import { GitRef } from "../../universal/git";

export type GraphTag = {
	label: string;
	type: GitRef["type"];
	endDecorators?: string[];
};

export function* toGraphTags(refs: Iterable<[string, GitRef[]]>) {
	for (const [k, v] of refs) {
		const tags: GraphTag[] = [];
		const branches = new Map<string, string[]>();

		for (const r of v) {
			if (r.type === "tag") tags.push({ type: "tag", label: r.name });
			if (r.type === "head") tags.push({ type: "head", label: "HEAD" });
			if (r.type === "stash") tags.push({ type: "stash", label: "stash" });
			if (r.type === "branch") {
				branches.set(r.name, [...(branches.get(r.name) ?? []), r.remote ?? ""]);
			}
		}

		for (const [branchName, origins] of branches) {
			if (origins.includes("")) {
				tags.push({
					type: "branch",
					label: branchName,
					endDecorators: origins.filter((o) => o !== ""),
				});
			} else {
				for (const origin of origins) {
					tags.push({
						type: "branch",
						label: `${origin}/${branchName}`,
					});
				}
			}
		}

		yield [k, tags];
	}
}
