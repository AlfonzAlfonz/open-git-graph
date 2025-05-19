import { useEffect, useState } from "react";
import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitCommit } from "../../../../universal/git";
import { renderEmptyRails } from "../GraphRow/renderRails";
import { CommitFileList } from "./CommitFileList";
import { bridge } from "../../../bridge";
import { renderState, useResolve } from "../../useResolve";

export const CommitInspector = ({ node }: { node: GraphNode<GitCommit> }) => {
	const { commit } = node;

	const [expanded] = useResolve(
		() => bridge.getCommit(commit.hash),
		[commit.hash],
	);

	return (
		<div className="commit-inspector">
			<div className="pl-3">{renderEmptyRails(node, 200)}</div>
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
						{renderState(expanded, {
							data: (d) => (
								<CommitFileList
									files={d.files}
									diff={{ a: commit.parents[0], b: commit.hash }}
								/>
							),
							loading: () => "Loading",
							error: () => "Fetching of files failed",
						})}
					</div>
				</div>
			</div>
		</div>
	);
};
