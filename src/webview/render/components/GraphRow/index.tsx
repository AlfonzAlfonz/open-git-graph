import { CSSProperties } from "preact/compat";
import { useState } from "preact/hooks";
import { getColor } from "../../../state/createGraphNodes/Rails.js";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { GraphTag } from "../../../state/toGraphTags.js";
import { renderRails } from "./renderRails.js";
import { renderTags } from "./renderTags.js";
import { CommitInspector } from "../CommitInspector/index.js";
import { useWebviewStore } from "../../../state/index.js";

export interface GraphRowProps {
	node: GraphNode;
	tags?: GraphTag[];
}

export const GraphRow = ({ node, tags }: GraphRowProps) => {
	const { expandedCommit, dispatch } = useWebviewStore();

	const isHead = tags?.some((r) => r.type === "head");

	return (
		<>
			<tr
				onClick={() =>
					dispatch({ type: "EXPAND_COMMMIT", commit: node.commit.hash })
				}
				class={`graph-row ${isHead ? "head" : ""} ${
					node.commit.parents.length > 1 ? "merge" : ""
				} ${getColor(node.position)}`}
				data-vscode-context={JSON.stringify({
					webviewSection: "commit",
					preventDefaultContextMenuItems: true,
					repo: window.__REPOSITORY,
					ref: node.commit.hash,
				})}
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
			{expandedCommit === node.commit.hash && <CommitInspector node={node} />}
		</>
	);
};
