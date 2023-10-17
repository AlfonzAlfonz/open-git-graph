import { GitCommit } from "../../../../universal/git.js";
import { bridge } from "../../../bridge.js";
import { useBridge } from "../../useBridge/useBridge.js";
import { CommitTags } from "./CommitTags.js";
import { renderRails } from "./renderRails.js";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow.js";

export const CommitGraphRow = ({
	node,
	tags,
	style,
}: UseGraphRowOptions<GitCommit> & { style: any }) => {
	const { data } = useBridge(bridge.getGraphData, []);
	const props = useGraphRow({ node, tags });

	return (
		<div style={style}>
			<div
				{...props}
				data-vscode-context={JSON.stringify({
					webviewSection: "commit",
					preventDefaultContextMenuItems: true,
					repo: data?.repoPath,
					ref: node.commit.hash,
				})}
			>
				<div>{renderRails(node)}</div>
				<div>
					<div className="flex gap-2 items-center">
						{tags && <CommitTags tags={tags} />}
						<p className="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
							{node.commit.subject}
						</p>
					</div>
				</div>
				<div className="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{node.commit.author}
				</div>
				<div className="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{new Date(node.commit.authorDate * 1000).toLocaleString()}
				</div>
				<div className="px-1 whitespace-nowrap text-ellipsis overflow-hidden">
					{node.commit.hash.slice(0, 10)}
				</div>
			</div>
			{/* {expandedCommit === node.commit.hash && <CommitInspector node={node} />} */}
		</div>
	);
};
