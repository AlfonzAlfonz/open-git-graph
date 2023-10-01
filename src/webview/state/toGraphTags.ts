import { GitRef } from "../../universal/git";

export function* toGraphTags(refs: Iterable<[string, GitRef[]]>) {
	for (const [k, v] of refs) {
		yield [
			k,
			v.reduce((acc, r) => {
				if (r.type === "tag" || r.type === "head") {
					acc.push({ label: "name" in r ? r.name : "HEAD", type: r.type });
				} else if (r.type === "stash") {
					acc.push({ type: "stash", label: "stash" });
				} else {
					const index = acc.findIndex(
						(x) => x.type === "branch" && x.label === r.name,
					);
					if (index !== -1) {
						if (r.remote) {
							acc[index]!.endDecorators!.push(r.remote);
						}
					} else {
						acc.push({
							label: r.name,
							type: "branch",
							endDecorators: r.remote ? [r.remote] : [],
						});
					}
				}
				return acc;
			}, [] as GraphTag[]),
		] as const;
	}
}

export type GraphTag = {
	label: string;
	type: GitRef["type"];
	endDecorators?: string[];
};
