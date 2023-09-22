import { ComponentChild } from "preact";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { getColor } from "../../../state/createGraphNodes/Rails.js";

const WIDTH = 16;
const HEIGHT = 26;
const CENTER = 0.5;

export const renderRails = (n: GraphNode) => {
	const width = n.rails.length + 1 + n.merges.length;

	const absoluteCoords = (x: number, y: number): [number, number] => [
		WIDTH / 2 + x * WIDTH,
		y * HEIGHT,
	];

	const rails: ComponentChild[] = [];

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

		rails.push(<path d={toBezier(x1, y1, x2, y2)} class={color} />);
	}

	// Render new rail
	const newRail = n.forks.find((f) => !n.rails.includes(f));
	if (newRail !== undefined) {
		const color = getColor(newRail);
		const [x1, y1] = absoluteCoords(n.rails.length, CENTER);
		const [x2, y2] = absoluteCoords(n.rails.length, 1);

		rails.push(<path d={toBezier(x1, y1, x2, y2)} class={color} />);
	}

	const color = getColor(n.position);
	const newRailOffset = Number(newRail !== undefined);

	// Render merged rails
	for (const [i, m] of n.merges.entries()) {
		const x = n.rails.length + newRailOffset - shift + i;
		const [x1, y1] = absoluteCoords(activeIndex, CENTER);
		const [x2, y2] = absoluteCoords(x, 1);

		rails.push(<path d={toBezier(x1, y1, x2, y2)} class={getColor(m)} />);
	}

	return (
		<svg width={(width + 1) * WIDTH} height={HEIGHT}>
			{rails}
			{/* Commit circle */}
			<circle cx={cx} cy={cy} r={3.5} class={color} />
		</svg>
	);
};

export const renderEmptyRails = (node: GraphNode, height: number) => {
	const absoluteCoords = (x: number, y: number): [number, number] => [
		WIDTH / 2 + x * WIDTH,
		y * height,
	];

	const toRender = [...node.rails.filter((r) => node.forks.includes(r))];

	const newRail = node.forks.find((f) => !node.rails.includes(f));
	const width = node.rails.length + +!!newRail;

	const rails: ComponentChild[] = [];

	for (const [x, r] of node.rails.entries()) {
		const color = getColor(r);

		const [x1, y1] = absoluteCoords(x, 0);
		const [x2, y2] = absoluteCoords(x, 1);

		rails.push(<path d={toBezier(x1, y1, x2, y2)} class={color} />);
	}
	if (!!newRail) {
		const [x1, y1] = absoluteCoords(node.rails.length, 0);
		const [x2, y2] = absoluteCoords(node.rails.length, 1);
		rails.push(<path d={toBezier(x1, y1, x2, y2)} class={getColor(newRail)} />);
	}

	return (
		<svg width={(width + 1) * WIDTH} height={height}>
			{rails}
		</svg>
	);
};

const toBezier = (x1: number, y1: number, x2: number, y2: number) =>
	`M ${x1} ${y1} C ${x1} ${y2}, ${x2} ${y1}, ${x2} ${y2} M ${x2} ${y2}`;
