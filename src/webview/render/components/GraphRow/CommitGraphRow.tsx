import { GitCommit } from "../../../../universal/git.js";
import { useWebviewStore } from "../../../state/index.js";
import { CommitInspector } from "../inspectors/CommitInspector.js";
import { CommitTags } from "./CommitTags.js";
import { renderRails } from "./renderRails.js";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow.js";

export const CommitGraphRow = ({
	node,
	tags,
}: UseGraphRowOptions<GitCommit>) => {
	const { expandedCommit } = useWebviewStore();
	const { onClick, className } = useGraphRow({ node, tags });

	return (
		<>
			<tr
				onClick={onClick}
				class={className}
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
