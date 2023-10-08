import { GitIndex } from "../../../../universal/git.js";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { renderEmptyRails } from "../GraphRow/renderRails.js";
import { CommitFileList } from "./CommitFileList.js";

export const IndexInspector = ({ node }: { node: GraphNode<GitIndex> }) => {
	return (
		<div class={"commit-inspector"}>
			<div>{renderEmptyRails(node, 200)}</div>
			<div colSpan={4}>
				<div class="flex leading-normal h-[200px] overflow-scroll">
					<div></div>
					<div class="w-full p-1 overflow-y-auto overflow-x-hidden text-ellipsis">
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
				</div>
			</div>
		</div>
	);
};
