import { GitCommit } from "../../../../universal/git";
import { formatDate, getColor } from "../../utils";
import { useAppContext } from "../AppContext";
import { CommitInspector } from "../inspectors/CommitInspector";
import { CommitTags } from "./CommitTags";
import { GraphRow } from "./GraphRow";
import { renderRails } from "./renderRails";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow";

export const CommitGraphRow = ({
	node,
	tags,
	style,
}: UseGraphRowOptions<GitCommit> & { style: any }) => {
	const { repoPath } = useAppContext();
	const { open, onClick, isHead } = useGraphRow({ node, tags });

	return (
		<div style={style}>
			<GraphRow
				// div props
				className={`graph-row ${isHead ? "head" : ""} ${
					node.commit.parents.length > 1 ? "merge" : ""
				} ${open ? "focused" : ""} ${getColor(node.position)}`}
				onClick={onClick}
				data-vscode-context={JSON.stringify({
					webviewSection: node.commit.type,
					preventDefaultContextMenuItems: true,
					repo: repoPath,
					reflogSelector: node.commit.reflogSelector,
				})}
				// content
				graph={renderRails(node)}
				tags={tags && <CommitTags tags={tags} />}
				info={node.commit.subject}
				author={node.commit.author}
				date={formatDate(node.commit.authorDate)}
				hash={node.commit.hash.slice(0, 10)}
			/>
			{open && <CommitInspector node={node} />}
		</div>
	);
};
