import { GitCommit } from "../../../../universal/git.js";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { renderEmptyRails } from "../GraphRow/renderRails.js";
import { CommitFileList } from "./CommitFileList.js";

export const CommitInspector = ({ node }: { node: GraphNode<GitCommit> }) => {
	const { commit } = node;

	return (
		<div class="commit-inspector">
			<div>{renderEmptyRails(node, 200)}</div>
			<div>
				<div class="flex leading-normal h-[200px] overflow-auto w-full">
					<div class="w-1/2 p-1 overflow-hidden text-ellipsis">
						<div>
							<span class="font-bold">Commit: </span>
							<span>{commit.hash}</span>
						</div>
						<div>
							<span class="font-bold">Author: </span>
							<span>{commit.author}</span>
						</div>
						<br />
						<div>{commit.subject}</div>
					</div>
					<div class="w-1/2 p-1 overflow-y-auto overflow-x-hidden text-ellipsis">
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
