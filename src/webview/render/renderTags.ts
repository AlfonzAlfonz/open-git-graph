import { GraphTag } from "../state/toGraphTags.js";
import { createEl } from "./utils.js";

export function* renderRefs(refs: GraphTag[]) {
	for (const r of refs) {
		if (r.type === "head") continue;

		yield createEl("div", { class: `graph-tag ${r.type}` }, [
			createEl("div", { class: "content" }, [r.label]),
			...(r.endDecorators
				? r.endDecorators.map((d) =>
						createEl("div", { class: "end-decorator" }, [d]),
				  )
				: []),
		]);
	}
}
