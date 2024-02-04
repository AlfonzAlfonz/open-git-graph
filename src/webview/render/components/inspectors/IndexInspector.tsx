import { GitIndex } from "../../../../universal/git";
import { GraphNode } from "../../../state/createGraphNodes/index";
import { renderEmptyRails } from "../GraphRow/renderRails";
import { CommitFileList } from "./CommitFileList";

export const IndexInspector = ({ node }: { node: GraphNode<GitIndex> }) => {
	return (
		<div className={"commit-inspector"}>
			<div>{renderEmptyRails(node, 200)}</div>
			<div>
				<div className="flex leading-normal h-[200px] overflow-scroll">
					<div></div>
					<div className="w-full p-1 overflow-y-auto overflow-x-hidden text-ellipsis">
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
