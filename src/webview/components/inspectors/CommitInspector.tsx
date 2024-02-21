import { GitCommit } from "../../../universal/git";
import { GraphNode } from "../../state/createGraphNodes/index";
import { renderEmptyRails } from "../GraphRow/renderRails";
import { CommitFileList } from "./CommitFileList";

export const CommitInspector = ({ node }: { node: GraphNode<GitCommit> }) => {
	const { commit } = node;

	return (
		<div className="commit-inspector">
			<div>{renderEmptyRails(node, 200)}</div>
			<div>
				<div className="flex leading-normal h-[200px] overflow-auto w-full">
					<div className="w-1/2 p-1 overflow-hidden text-ellipsis">
						<div>
							<span className="font-bold">Commit: </span>
							<span>{commit.hash}</span>
						</div>
						<div>
							<span className="font-bold">Author: </span>
							<span>{commit.author}</span>
						</div>
						<br />
						<div>{commit.subject}</div>
					</div>
					<div className="w-1/2 p-1 overflow-y-auto overflow-x-hidden text-ellipsis">
						<CommitFileList
							files={commit.files}
							diff={{ a: commit.parents[0], b: commit.hash }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
