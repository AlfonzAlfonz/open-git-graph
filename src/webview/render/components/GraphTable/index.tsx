import { useEffect, useMemo, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { GitCommit, GitIndex } from "../../../../universal/git";
import { bridge } from "../../../bridge";
import { GraphNode, createGraphNodes } from "../../../state/createGraphNodes";
import { groupBy } from "../../../state/groupBy";
import { GraphTag, toGraphTags } from "../../../state/toGraphTags";
import { useBridge } from "../../useBridge/useBridge";
import { CommitGraphRow } from "../GraphRow/CommitGraphRow";
import { IndexGraphRow } from "../GraphRow/IndexGraphRow";
import { HEIGHT } from "../GraphRow/renderRails";

export const GraphTable = () => {
	const listRef = useRef<VariableSizeList>(null!);

	const state = useBridge(bridge.getState, []);
	const expandedCommit = state.data?.expandedCommit;
	const { data } = useBridge(bridge.getGraphData, []);

	const graph = useMemo(
		() => data && createGraphNodes(data.commits, data.index),
		[data],
	);

	const tags = useMemo(
		() =>
			data &&
			Object.fromEntries(toGraphTags(groupBy(data.refs, (r) => r.hash))),
		[data],
	);

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => listRef.current?.resetAfterIndex(0), [expandedCommit]);

	return (
		<div id="graph" className={"h-[100vh]"} ref={ref}>
			<div className={"graph-header"}>
				<PanelGroup className="flex" direction="horizontal" units="pixels">
					<Panel minSize={150} maxSize={150}>
						Graph
					</Panel>
					<PanelResizeHandle className="resize-handle" />
					<Panel>Info</Panel>
					<PanelResizeHandle className="resize-handle" />
					<Panel minSize={120} maxSize={120}>
						Author
					</Panel>
					<PanelResizeHandle className="resize-handle" />
					<Panel minSize={100} maxSize={100}>
						Date
					</Panel>
					<PanelResizeHandle className="resize-handle" />
					<Panel minSize={100} maxSize={100}>
						Hash
					</Panel>
				</PanelGroup>
			</div>
			{graph && (
				<AutoSizer>
					{({ height, width }) => (
						<VariableSizeList
							ref={listRef}
							itemSize={(i) => {
								const node = graph!.nodes[i]!;
								if ("hash" in node.commit) {
									return expandedCommit === node.commit.hash
										? HEIGHT + 200
										: HEIGHT;
								} else {
									return expandedCommit === "index" ? HEIGHT + 200 : HEIGHT;
								}
							}}
							width={width}
							height={height}
							itemData={{ nodes: graph!.nodes, tags: tags.data }}
							itemCount={graph!.nodes.length}
							children={Row}
						/>
					)}
				</AutoSizer>
			)}
		</div>
	);
};

interface RowData {
	nodes: GraphNode[];
	tags?: Record<string, GraphTag[]>;
}

const Row = ({ data, index, style }: ListChildComponentProps<RowData>) => {
	const node = data.nodes[index]!;
	const tags =
		"hash" in node.commit ? data.tags?.[node.commit.hash] : undefined;

	return "hash" in node.commit ? (
		<CommitGraphRow
			node={node as GraphNode<GitCommit>}
			tags={tags}
			style={style}
		/>
	) : (
		<IndexGraphRow node={node as GraphNode<GitIndex>} style={style} />
	);
};
