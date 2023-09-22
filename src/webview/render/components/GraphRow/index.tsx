import { useState } from "preact/hooks";
import { getColor } from "../../../state/createGraphNodes/Rails.js";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { GraphTag } from "../../../state/toGraphTags.js";
import { renderRails } from "./renderRails.js";
import { renderTags } from "./renderTags.js";
import { CommitInspector } from "../CommitInspector/index.js";

export const GraphRow = ({
	node,
	tags,
}: {
	node: GraphNode;
	tags?: GraphTag[];
}) => {
	const [open, setOpen] = useState(false);
	const isHead = tags?.some((r) => r.type === "head");
	return (
		<>
			<tr
				onClick={() => setOpen((s) => !s)}
				class={`${isHead ? "head" : ""} ${
					node.commit.parents.length > 1 ? "merge" : ""
				} ${getColor(node.position)}`}
			>
				<td>{renderRails(node)}</td>
				<td>
					<div class="flex gap-2 items-center">
						{tags && renderTags(tags)}
						{node.commit.subject}
					</div>
				</td>
				<td>{node.commit.author}</td>
				<td>{new Date(node.commit.authorDate).toString()}</td>
				<td>{node.commit.hash.slice(0, 10)}</td>
			</tr>
			{open && <CommitInspector node={node} />}
		</>
	);
};
