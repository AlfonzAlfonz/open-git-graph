import { GitRef, GitRefFullname } from "./git";

export const resolveActiveRefs = (
	fullNames: GitRefFullname[],
	refs: Map<GitRefFullname | "head", GitRef>,
) => {
	const values = [...refs.values()];
	const x = fullNames.flatMap((fullname) => {
		if (fullname.startsWith("ogg/categories/")) {
			const [category, subcategory] = fullname
				.slice("ogg/categories/".length)
				.split("/") as [string, string | undefined];

			if (category === "local") {
				return values.filter(
					(ref) => ref.type === "branch" && ref.remote === undefined,
				);
			}
			if (category === "remotes") {
				return values.filter(
					(ref) => ref.type === "branch" && ref.remote === subcategory,
				);
			}
			if (category === "tags") {
				return values.filter((ref) => ref.type === "tag");
			}
		}

		return refs.get(fullname)!;
	});

	return x;
};
