import { RefObject, render as renderPreact } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useWebviewStore } from "../state/index.js";
import { GraphRow } from "./components/GraphRow/index.js";
import { Loading } from "./components/Loading.js";

const graphDiv = document.querySelector("#root")!;

export const render = () => {
	renderPreact(<App />, graphDiv);
};

const App = () => {
	const { graph, tags, dispatch } = useWebviewStore();

	useEffect(() => {
		dispatch({ type: "INIT" });
	}, []);

	return (
		<>
			{graph?.data && <Table />}

			{!graph?.data && (
				<div class="w-[100vw] h-[100vh] flex items-center justify-center">
					<Loading />
				</div>
			)}
		</>
	);
};

const Table = () => {
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
					<th>Graph</th>
					<th>Info</th>
					<th>Author</th>
					<th>Commited</th>
					<th>Hash</th>
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

const useVirtualTable = <T,>({
	ref,
	rowHeight,
	data,
}: {
	ref: RefObject<HTMLElement>;
	rowHeight: number;
	data: T[];
}) => {
	const [firstIndex, setFirstIndex] = useState(0);
	const [sliceLength, setSliceLength] = useState(0);

	useEffect(() => {
		const h = () => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			const top = Math.min(rect.top, 0);
			const height = window.innerHeight - Math.max(rect.top, 0);

			setFirstIndex(Math.floor(-top / rowHeight));
			setSliceLength(Math.ceil(height / rowHeight));
		};
		window.addEventListener("scroll", h);
		window.addEventListener("resize", h);
		h();

		return () => {
			window.removeEventListener("scroll", h);
			window.removeEventListener("resize", h);
		};
	}, []);

	return {
		topPadding: firstIndex * rowHeight,
		slice: data.slice(firstIndex, firstIndex + sliceLength + 1),
		bottomPadding: (data.length - (firstIndex + sliceLength)) * rowHeight,
	};
};
