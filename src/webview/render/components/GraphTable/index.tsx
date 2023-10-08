import { ComponentChild } from "preact";
import { useEffect, useRef } from "preact/hooks";
import * as ResizablePanels from "react-resizable-panels";
import ReactAutoSizer from "react-virtualized-auto-sizer";
import * as ReactWindow from "react-window";
import { GitCommit, GitIndex } from "../../../../universal/git";
import { useWebviewStore } from "../../../state";
import { GraphNode } from "../../../state/createGraphNodes";
import { GraphTag } from "../../../state/toGraphTags";
import { PreactComponent } from "../../utils";
import { CommitGraphRow } from "../GraphRow/CommitGraphRow";
import { IndexGraphRow } from "../GraphRow/IndexGraphRow";
import { HEIGHT } from "../GraphRow/renderRails";

export const GraphTable = () => {
	const listRef = useRef<ReactWindow.VariableSizeList>();
	const { graph, tags, expandedCommit } = useWebviewStore();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		listRef.current?.resetAfterIndex(0);
	}, [expandedCommit]);

	return (
		<div id="graph" class={"h-[100vh]"} ref={ref}>
			<div class={"graph-header"}>
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
			{graph.data && (
				<AutoSizer>
					{({ height, width }) => (
						<List
							ref={listRef}
							itemSize={(i) => {
								const node = graph.data!.nodes[i]!;
								if ("hash" in node.commit) {
									console.log(expandedCommit, node.commit.hash);
									return expandedCommit === node.commit.hash
										? HEIGHT + 200
										: HEIGHT;
								} else {
									return expandedCommit === "index" ? HEIGHT + 200 : HEIGHT;
								}
							}}
							width={(console.log({ height, width }), width)}
							height={height}
							itemData={{ nodes: graph.data!.nodes, tags: tags.data }}
							itemCount={graph.data!.nodes.length}
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
	tags: Record<string, GraphTag[]>;
}

const Row = ({
	data,
	index,
	style,
}: ReactWindow.ListChildComponentProps<RowData>) => {
	const node = data.nodes[index]!;
	const tags = "hash" in node.commit ? data.tags[node.commit.hash] : undefined;

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

const List =
	ReactWindow.VariableSizeList as any as PreactComponent<ReactWindow.VariableSizeListProps>;

const AutoSizer = ReactAutoSizer as any as PreactComponent<
	{},
	(size: { height: number; width: number }) => ComponentChild
>;

const PanelGroup =
	ResizablePanels.PanelGroup as PreactComponent<ResizablePanels.PanelGroupProps>;

const Panel =
	ResizablePanels.Panel as PreactComponent<ResizablePanels.PanelProps>;

const PanelResizeHandle = ResizablePanels.PanelResizeHandle as PreactComponent<
	ResizablePanels.PanelResizeHandleProps,
	undefined
>;
