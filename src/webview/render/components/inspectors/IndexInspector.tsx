import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitIndex } from "../../../../universal/git";
import { GraphRow } from "../GraphRow/GraphRow";
import { renderEmptyRails } from "../GraphRow/renderRails";
import { CommitFileList } from "./CommitFileList";

export const IndexInspector = ({ node }: { node: GraphNode<GitIndex> }) => {
	return (
		<GraphRow
			className="commit-inspector"
			graph={renderEmptyRails(node, 200)}
			tags={
				<div className="w-full p-1">
					<div>Staged changes</div>
					<CommitFileList
						files={node.commit.tracked}
						diff={{ b: node.commit.parents[0] }}
					/>

					<div>Changes</div>
					<CommitFileList
						files={node.commit.untracked}
						diff={{ b: node.commit.parents[0] }}
					/>
				</div>
			}
		/>
	);
};
