import { GraphNode } from "../../../state/createGraphNodes.js";
import { GraphTag } from "../../../state/toGraphTags.js";
import { renderRails } from "./renderRails.js";
import { renderTags } from "./renderTags.js";

export const GraphRow = ({
	node,
	tags,
	width,
}: {
	node: GraphNode;
	tags?: GraphTag[];
	width: number;
}) => {
	const isHead = tags?.some((r) => r.type === "head");
	return (
		<tr
			class={`${isHead ? "head" : ""} ${
				node.commit.parents.length > 1 ? "head" : ""
			}`}
		>
			<td>{renderRails(node, width)}</td>
			<td>
				<div>
					{tags && renderTags(tags)}
					{node.commit.subject}
				</div>
			</td>
			<td>{node.commit.author}</td>
			<td>{new Date(node.commit.authorDate).toString()}</td>
			<td>{node.commit.hash.slice(0, 10)}</td>
		</tr>
	);
};
