import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitCommit } from "../../../../universal/git";
import { bridge } from "../../../bridge";
import { renderState, useResolve } from "../../useResolve";
import { GraphRow } from "../GraphRow/GraphRow";
import { renderEmptyRails } from "../GraphRow/renderRails";
import { CommitFileList } from "./CommitFileList";
import { formatDate } from "../../utils";

export const CommitInspector = ({ node }: { node: GraphNode<GitCommit> }) => {
	const { commit } = node;

	const [expanded] = useResolve(
		() => bridge.getCommit(commit.hash),
		[commit.hash],
	);

	return (
		<GraphRow
			className="commit-inspector"
			graph={renderEmptyRails(node, 200)}
			tags={
				<PanelGroup direction="horizontal" className="-mx-2">
					<Panel className="p-2" style={{ overflow: "auto" }}>
						<table>
							<tr>
								<td className="font-bold">Commit: </td>
								<td>{commit.hash}</td>
							</tr>
							<tr>
								<td className="font-bold">Parents: </td>
								<td>{commit.parents.join(", ")}</td>
							</tr>
							<tr>
								<td className="font-bold">Author: </td>
								<td>{commit.author}</td>
							</tr>
							<tr>
								<td className="font-bold">Date: </td>
								<td>{formatDate(commit.authorDate)}</td>
							</tr>
						</table>
						<br />
						<div>{commit.subject}</div>
					</Panel>
					<PanelResizeHandle />
					<Panel className="p-2" style={{ overflow: "auto" }}>
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
					</Panel>
				</PanelGroup>
			}
		/>
	);
};
