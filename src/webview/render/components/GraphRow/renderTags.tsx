import { GraphTag } from "../../../state/toGraphTags.js";

export const renderTags = (tags: GraphTag[]) =>
	tags.map(
		(r) =>
			r.type !== "head" && (
				<div class={`graph-tag ${r.type}`}>
					<div class="content">{r.label}</div>
					{r.endDecorators?.map((d) => <div class={"end-decorator"}>{d}</div>)}
				</div>
			),
	);
