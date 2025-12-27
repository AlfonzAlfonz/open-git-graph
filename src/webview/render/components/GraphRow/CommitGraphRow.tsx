import { GitCommit } from "../../../../universal/git";
import { commitMenuContext } from "../../../../universal/menuContext/commit";
import { stashMenuContext } from "../../../../universal/menuContext/stash";
import { formatDate, getColor } from "../../utils";
import { useAppContext } from "../../contexts/AppContext";
import { CommitInspector } from "../inspectors/CommitInspector";
import { CommitBadges } from "./CommitBadges";
import { GraphRow } from "./GraphRow";
import { renderRails } from "./renderRails";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow";

export const CommitGraphRow = ({
	node,
	badges,
	style,
}: UseGraphRowOptions<GitCommit> & { style: any }) => {
	const { repoPath } = useAppContext();
	const { open, onClick, isHead } = useGraphRow({ node, badges });

	return (
		<div style={style}>
			<GraphRow
				// div props
				className={`graph-row ${isHead ? "head" : ""} ${
					node.commit.parents.length > 1 ? "merge" : ""
				} ${open ? "focused" : ""} ${getColor(node.position)}`}
				onClick={onClick}
				data-vscode-context={
					repoPath &&
					JSON.stringify(
						node.commit.type === "commit"
							? commitMenuContext({ repo: repoPath, hash: node.commit.hash })
							: stashMenuContext({
									repo: repoPath,
									reflogSelector: node.commit.reflogSelector!,
							  }),
					)
				}
				// content
				graph={renderRails(node)}
				badges={badges && <CommitBadges badges={badges} />}
				info={node.commit.subject}
				author={node.commit.author}
				date={formatDate(node.commit.authorDate)}
				hash={node.commit.hash.slice(0, 10)}
			/>
			{open && <CommitInspector node={node} />}
		</div>
	);
};
