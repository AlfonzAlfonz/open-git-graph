import { GitCommit } from "../../../../universal/git.js";
import { useWebviewStore } from "../../../state/index.js";
import { CommitInspector } from "../inspectors/CommitInspector.js";
import { CommitTags } from "./CommitTags.js";
import { renderRails } from "./renderRails.js";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow.js";

export const CommitGraphRow = ({
	node,
	tags,
	style,
}: UseGraphRowOptions<GitCommit> & { style: any }) => {
	const { expandedCommit } = useWebviewStore();
	const props = useGraphRow({ node, tags });

	return (
		<div style={style}>
			<div
				{...props}
				data-vscode-context={JSON.stringify({
					webviewSection: "commit",
					preventDefaultContextMenuItems: true,
					repo: window.__REPOSITORY,
					ref: node.commit.hash,
				})}
			>
				<div>{renderRails(node)}</div>
				<div>
					<div class="flex gap-2 items-center">
						{tags && <CommitTags tags={tags} />}
						<p class="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
							{node.commit.subject}
						</p>
					</div>
				</div>
				<div class="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{node.commit.author}
				</div>
				<div class="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{new Date(node.commit.authorDate * 1000).toLocaleString()}
				</div>
				<div class="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{node.commit.hash.slice(0, 10)}
				</div>
			</div>
			{expandedCommit === node.commit.hash && <CommitInspector node={node} />}
		</div>
	);
};
