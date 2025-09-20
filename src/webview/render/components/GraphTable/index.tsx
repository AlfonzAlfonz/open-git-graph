import { useEffect, useMemo, useRef } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitCommit, GitIndex } from "../../../../universal/git";
import { groupBy } from "../../../../universal/groupBy";
import { bridge } from "../../../bridge";
import { GraphBadge, toGraphBadges } from "../../../state/toGraphBadges";
import { useAppContext } from "../AppContext";
import { CommitGraphRow } from "../GraphRow/CommitGraphRow";
import { IndexGraphRow } from "../GraphRow/IndexGraphRow";
import { HEIGHT } from "../GraphRow/renderRails";
import { GraphTableLayout } from "./GraphTableLayout";

export const GraphTable = () => {
	const { searchResults } = useAppContext();

	const initScrollRef = useRef(false);
	const listRef = useRef<VariableSizeList>(null!);
	const graphRef = useRef<HTMLDivElement>(null!);

	const { graph, refs, expandedCommit, scroll, actions } = useAppContext();

	const badges = useMemo(
		() => refs && new Map(toGraphBadges(groupBy(refs, (r) => r.hash))),
		[refs],
	);

	useEffect(() => listRef.current?.resetAfterIndex(0), [expandedCommit]);

	useEffect(() => {
		if (listRef.current && !initScrollRef.current && scroll !== undefined) {
			listRef.current.scrollTo(scroll);
			initScrollRef.current = true;
		}
	});

	useEffect(() => {
		if (searchResults?.currentResult?.rowIndex) {
			listRef.current.scrollToItem(
				searchResults.currentResult?.rowIndex,
				"start",
			);
		}
	}, [searchResults]);

	return (
		<GraphTableLayout>
			<AutoSizer>
				{({ height, width }) => (
					<InfiniteLoader
						isItemLoaded={(i) => !!graph && i < graph.nodes.length}
						itemCount={graph ? graph.nodes.length * 2 : 0}
						loadMoreItems={async () => {
							await bridge.pollGraphData();
						}}
					>
						{({ onItemsRendered, ref }) => (
							<>
								<VariableSizeList
									className="graph-list"
									ref={(value) => {
										ref(value);
										listRef.current = value!;
									}}
									outerRef={graphRef}
									itemSize={(i) => {
										const node = graph?.nodes[i]!;
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
									itemData={{ nodes: graph?.nodes ?? [], badges: badges }}
									itemCount={graph?.nodes.length ?? 0}
									children={Row}
									onItemsRendered={onItemsRendered}
									onScroll={({ scrollOffset }) => {
										if (initScrollRef.current) {
											actions.scroll(scrollOffset);
										}
									}}
								/>
								{/* TODO: Fix Slider component */}
								{/* <Slider parent={graphRef} /> */}
							</>
						)}
					</InfiniteLoader>
				)}
			</AutoSizer>
		</GraphTableLayout>
	);
};

interface RowData {
	nodes: GraphNode[];
	badges?: Map<string, GraphBadge[]>;
}

const Row = ({ data, index, style }: ListChildComponentProps<RowData>) => {
	const node = data.nodes[index]!;

	return "hash" in node.commit ? (
		<CommitGraphRow
			index={index}
			node={node as GraphNode<GitCommit>}
			badges={data.badges?.get(node.commit.hash)}
			style={style}
		/>
	) : (
		<IndexGraphRow node={node as GraphNode<GitIndex>} style={style} />
	);
};
