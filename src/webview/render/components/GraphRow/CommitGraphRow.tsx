import { GitCommit } from "../../../../universal/git";
import { useAppContext } from "../AppContext";
import { CommitInspector } from "../inspectors/CommitInspector";
import { CommitTags } from "./CommitTags";
import { renderRails } from "./renderRails";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow";

export const CommitGraphRow = ({
	node,
	tags,
	style,
}: UseGraphRowOptions<GitCommit> & { style: any }) => {
	const { repoPath } = useAppContext();
	const { open, ...props } = useGraphRow({ node, tags });

	return (
		<div style={style}>
			<div
				{...props}
				data-vscode-context={JSON.stringify({
					webviewSection: "commit",
					preventDefaultContextMenuItems: true,
					repo: repoPath,
					ref: node.commit.hash,
				})}
			>
				<div
					className="h-[26px] pl-3 overflow-hidden"
					style={{ flex: "var(--table-graph-width) 1 0px" }}
				>
					{renderRails(node)}
				</div>
				<div
					className="flex gap-2 items-center"
					style={{ flex: "var(--table-info-width) 1 0px" }}
				>
					{tags && <CommitTags tags={tags} />}
					<p className="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
						{node.commit.subject}
					</p>
				</div>
				<div
					className="px-1 whitespace-nowrap text-ellipsis overflow-hidden"
					style={{ flex: "var(--table-author-width) 1 0px" }}
				>
					{node.commit.author}
				</div>
				<div
					className="px-1 whitespace-nowrap text-ellipsis overflow-hidden"
					style={{ flex: "var(--table-date-width) 1 0px" }}
				>
					{new Date(node.commit.authorDate * 1000).toLocaleString()}
				</div>
				<div
					className="px-1 whitespace-nowrap text-ellipsis overflow-hidden"
					style={{ flex: "var(--table-hash-width) 1 0px" }}
				>
					{node.commit.hash.slice(0, 10)}
				</div>
			</div>
			{open && <CommitInspector node={node} />}
		</div>
	);
};
