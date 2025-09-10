import { ReactNode, useEffect, useRef, useState } from "react";
import {
	ImperativePanelGroupHandle,
	Panel,
	PanelGroup,
	PanelResizeHandle,
} from "react-resizable-panels";
import { TopBar } from "../TopBar";

interface Props {
	children: ReactNode;
}

export const GraphTableLayout = ({ children }: Props) => {
	const headerRef = useRef<HTMLDivElement>(null);
	const groupRef = useRef<ImperativePanelGroupHandle>(null);
	const graphRef = useRef<HTMLDivElement>(null!);

	const [layout, setLayout] = useState<number[]>([]);

	useEffect(() => {
		const { width } = headerRef.current!.getBoundingClientRect();

		const graphWidth = Math.round((150 / width) * 100);
		const authorWidth = Math.round((100 / width) * 100);
		const dateWidth = Math.round((100 / width) * 100);
		const hashWidth = Math.round((100 / width) * 80);
		const infoWidth = 100 - (graphWidth + authorWidth + dateWidth + hashWidth);

		groupRef.current!.setLayout([
			graphWidth,
			infoWidth,
			authorWidth,
			dateWidth,
			hashWidth,
		]);
	}, []);

	return (
		<div id="graph" className={"h-[100vh] flex flex-col"} ref={graphRef}>
			<TopBar />
			<div className="graph-header" ref={headerRef}>
				<PanelGroup
					className="flex"
					direction="horizontal"
					ref={groupRef}
					onLayout={setLayout}
				>
					<Panel className="graph-col">Graph</Panel>
					<PanelResizeHandle className="resize-handle" />
					<Panel className="graph-col">Info</Panel>
					<PanelResizeHandle className="resize-handle" />
					<Panel className="graph-col">Author</Panel>
					<PanelResizeHandle className="resize-handle" />
					<Panel className="graph-col">Date</Panel>
					<PanelResizeHandle className="resize-handle" />
					<Panel className="graph-col">Hash</Panel>
				</PanelGroup>
			</div>
			<div
				style={
					{
						position: "relative",
						flex: "1 1 auto",
						"--table-graph-width": layout[0]?.toFixed(2),
						"--table-info-width": layout[1]?.toFixed(2),
						"--table-author-width": layout[2]?.toFixed(2),
						"--table-date-width": layout[3]?.toFixed(2),
						"--table-hash-width": layout[4]?.toFixed(2),
						"--table-index-width":
							Number(layout[1]?.toFixed(2)) +
							Number(layout[2]?.toFixed(2)) +
							Number(layout[3]?.toFixed(2)) +
							Number(layout[4]?.toFixed(2)),
					} as React.CSSProperties
				}
			>
				{children}
			</div>
		</div>
	);
};
