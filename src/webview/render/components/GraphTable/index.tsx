import { ComponentChild } from "preact";
import { useRef } from "preact/hooks";
import { useWebviewStore } from "../../../state";
import { GraphRow } from "../GraphRow";
import { useDragHandle } from "./useDragHandle";
import { useVirtualTable } from "./useVirtualTable";

export const GraphTable = () => {
	const { graph, tags } = useWebviewStore();

	const ref = useRef<HTMLTableSectionElement>(null);
	const { topPadding, slice, bottomPadding } = useVirtualTable({
		ref,
		rowHeight: 26,
		data: graph.data?.nodes ?? [],
	});

	return (
		<table id="graph" class="w-full border-collapse h-[100vh]">
			<thead>
				<tr>
					<TableHeader drag="post" minWidth={70}>
						Graph
					</TableHeader>
					<TableHeader drag="none">Info</TableHeader>
					<TableHeader drag="pre">Author</TableHeader>
					<TableHeader drag="pre">Commited</TableHeader>
					<TableHeader drag="pre">Hash</TableHeader>
				</tr>
			</thead>
			<tbody ref={ref} class="relative">
				<tr style={{ height: `${topPadding}px` }}>
					<td colSpan={9} />
				</tr>
				{slice.map((node) => (
					<GraphRow
						key={node.commit.hash}
						node={node}
						tags={tags.data?.[node.commit.hash]}
					/>
				))}
				<tr style={{ height: `${bottomPadding}px` }}>
					<td colSpan={9} />
				</tr>
			</tbody>
		</table>
	);
};

export const TableHeader = ({
	children,
	drag,
	minWidth,
}: {
	children: ComponentChild;
	drag: "pre" | "post" | "none";
	minWidth?: number;
}) => {
	const ref = useRef<HTMLTableCellElement>(null);
	const props = useDragHandle(ref, drag, minWidth);

	return (
		<th ref={ref}>
			<div class={"flex w-full"}>
				{(drag === "post" || drag === "none") && (
					<div class={"grow"}>{children}</div>
				)}
				{drag !== "none" && <div draggable class={"handle"} {...props}></div>}
				{drag === "pre" && <div class={"grow"}>{children}</div>}
			</div>
		</th>
	);
};
