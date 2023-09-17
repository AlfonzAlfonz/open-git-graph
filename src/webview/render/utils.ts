import { RailId } from "../state/rails";

export const createSVG = <T extends keyof SVGElementTagNameMap>(
	tag: T,
	attrs?: Record<string, string | number>,
) => {
	const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
	for (const [k, a] of Object.entries(attrs ?? {})) {
		el.setAttributeNS(null, k, String(a));
	}
	return el;
};

export const createEl = <T extends keyof HTMLElementTagNameMap>(
	tag: T,
	attrs?: Record<string, string | number>,
	children?: string | Node | (Node | string)[],
) => {
	const el = document.createElement(tag);
	for (const [k, a] of Object.entries(attrs ?? {})) {
		el.setAttribute(k, String(a));
	}
	if (typeof children === "string" || children instanceof Node) {
		el.append(children);
	} else if (Array.isArray(children)) {
		el.append(...children);
	}

	return el;
};

const colors = ["indigo", "pink", "emerald", "amber", "sky", "yellow", "red"];
export const getColor = (x: RailId) => colors[x % colors.length]!;
