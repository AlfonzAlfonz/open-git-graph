import { getColor } from "../../../state/createGraphNodes/Rails.js";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { useWebviewStore } from "../../../state/index.js";
import { GraphTag } from "../../../state/toGraphTags.js";
import { CommitInspector } from "../CommitInspector/index.js";
import { CommitTags } from "./CommitTags.js";
import { renderRails } from "./renderRails.js";

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
				onClick={(e) => {
					if (e.detail > 1) {
						return;
					}
					dispatch({ type: "EXPAND_COMMMIT", commit: node.commit.hash });
				}}
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
						{tags && <CommitTags tags={tags} />}
						<p class="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
							{node.commit.subject}
						</p>
					</div>
				</td>
				<td class="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{node.commit.author}
				</td>
				<td class="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{new Date(node.commit.authorDate * 1000).toLocaleString()}
				</td>
				<td class="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{node.commit.hash.slice(0, 10)}
				</td>
			</tr>
			{expandedCommit === node.commit.hash && <CommitInspector node={node} />}
		</>
	);
};
