import { GraphNode } from "../state/createGraphNodes.js";
import { createSVG, getColor } from "./utils.js";

const WIDTH = 16;
const HEIGHT = 26;
const CENTER = 1 - 1 / 3;

export const renderNode = (n: GraphNode, width: number) => {
	const row = createSVG("svg", {
		width: (width + 1) * WIDTH,
		height: HEIGHT,
	});

	const absoluteCoords = (x: number, y: number): [number, number] => [
		WIDTH / 2 + x * WIDTH,
		y * HEIGHT,
	];

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

		row.appendChild(
			createSVG("path", { d: toBezier(x1, y1, x2, y2), class: color }),
		);
	}

	// Render new rail
	const newRail = n.forks.find((f) => !n.rails.includes(f));
	if (newRail !== undefined) {
		const color = getColor(newRail);
		const [x1, y1] = absoluteCoords(n.rails.length, CENTER);
		const [x2, y2] = absoluteCoords(n.rails.length, 1);

		row.appendChild(
			createSVG("path", { d: toBezier(x1, y1, x2, y2), class: color }),
		);
	}

	const color = getColor(n.position);
	const newRailOffset = Number(newRail !== undefined);

	// Render merged rails
	for (const [i, m] of n.merges.entries()) {
		const x = n.rails.length + newRailOffset - shift + i;
		const [x1, y1] = absoluteCoords(activeIndex, CENTER);
		const [x2, y2] = absoluteCoords(x, 1);

		row.appendChild(
			createSVG("path", { d: toBezier(x1, y1, x2, y2), class: getColor(m) }),
		);
	}

	// Render commit circle
	row.appendChild(
		createSVG("circle", {
			cx,
			cy,
			r: 3.5,
			class: color,
		}),
	);

	return row;
};

const toBezier = (x1: number, y1: number, x2: number, y2: number) =>
	`M ${x1} ${y1} C ${x1} ${y2}, ${x2} ${y1}, ${x2} ${y2} M ${x2} ${y2}`;
