import { ReactNode } from "react";
import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { getColor } from "../../utils";

const WIDTH = 16;
export const HEIGHT = 26;
const CENTER = 0.5;

export const renderRails = (n: GraphNode) => {
	const width = n.rails.length + 1 + n.merges.length;

	const absoluteCoords = (x: number, y: number): [number, number] => [
		WIDTH / 2 + x * WIDTH,
		y * HEIGHT,
	];

	const rails: ReactNode[] = [];

	let shift = 0;
	let activeIndex = n.rails.findIndex((r) => n.position === r);
	activeIndex = activeIndex === -1 ? n.rails.length : activeIndex;
	const [cx, cy] = absoluteCoords(activeIndex, CENTER);

	// Render fork and straight rails
	for (const [x, r] of n.rails.entries()) {
		const color = getColor(r);
		const isForked = n.forks.includes(r);

		const [x1, y1] = absoluteCoords(x, 0);
		const [x2, y2] = isForked ? [cx, cy] : absoluteCoords(x - shift, 1);

		if (isForked) {
			shift++;
		}

		rails.push(
			<path
				key={rails.length}
				d={toBezier(x1, y1, x2, y2)}
				className={color}
			/>,
		);
	}

	// Render new rail
	const newRail = n.forks.find((f) => !n.rails.includes(f));
	if (newRail !== undefined) {
		const color = getColor(newRail);
		const [x1, y1] = absoluteCoords(n.rails.length, CENTER);
		const [x2, y2] = absoluteCoords(n.rails.length, 1);

		rails.push(
			<path
				key={rails.length}
				d={toBezier(x1, y1, x2, y2)}
				className={color}
			/>,
		);
	}

	const color = getColor(n.position);
	const newRailOffset = Number(newRail !== undefined);

	// Render merged rails
	for (const [i, m] of n.merges.entries()) {
		const x = n.rails.length + newRailOffset - shift + i;
		const [x1, y1] = absoluteCoords(activeIndex, CENTER);
		const [x2, y2] = absoluteCoords(x, 1);

		rails.push(
			<path
				key={rails.length}
				d={toBezier(x1, y1, x2, y2)}
				className={getColor(m)}
			/>,
		);
	}

	const s = 3.5;
	return (
		<svg width={(width + 1) * WIDTH} height={HEIGHT} className="!ml-3">
			{rails}
			{/* Commit circle */}
			<rect
				x={cx - s / 2}
				y={cy - s / 2}
				width={s}
				height={s}
				className={color}
			/>
		</svg>
	);
};

export const renderEmptyRails = (node: GraphNode, height: number) => {
	const absoluteCoords = (x: number, y: number): [number, number] => [
		WIDTH / 2 + x * WIDTH,
		y * height,
	];

	let shift = 0;
	let activeIndex = node.rails.findIndex((r) => node.position === r);
	activeIndex = activeIndex === -1 ? node.rails.length : activeIndex;
	const newRail = node.forks.find((f) => !node.rails.includes(f));
	const width = node.rails.length + +!!newRail;

	const rails: ReactNode[] = [];

	for (const [x, r] of node.rails.entries()) {
		const color = getColor(r);

		const [x1, y1] = absoluteCoords(x - shift, 0);
		const [x2, y2] = absoluteCoords(x - shift, 1);

		if (node.forks.includes(r)) {
			shift++;
			continue;
		}

		rails.push(<path d={toBezier(x1, y1, x2, y2)} className={color} />);
	}
	if (newRail !== undefined) {
		const [x1, y1] = absoluteCoords(node.rails.length, 0);
		const [x2, y2] = absoluteCoords(node.rails.length, 1);
		rails.push(
			<path d={toBezier(x1, y1, x2, y2)} className={getColor(newRail)} />,
		);
	}

	const newRailOffset = Number(newRail !== undefined);
	for (const [i, m] of node.merges.entries()) {
		const x = node.rails.length + newRailOffset - shift + i;
		const [x1, y1] = absoluteCoords(x, 0);
		const [x2, y2] = absoluteCoords(x, 1);

		rails.push(
			<path
				key={rails.length}
				d={toBezier(x1, y1, x2, y2)}
				className={getColor(m)}
			/>,
		);
	}

	return (
		<svg width={(width + 1) * WIDTH} height={height} className="!ml-3">
			{rails}
		</svg>
	);
};

const toBezier = (x1: number, y1: number, x2: number, y2: number) =>
	`M ${x1} ${y1} C ${x1} ${y2}, ${x2} ${y1}, ${x2} ${y2} M ${x2} ${y2}`;
