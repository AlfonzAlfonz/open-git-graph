import { FromRuntimeMessage } from "../../types/messages";
import { Graph, createGraphNodes } from "./createGraphNodes";
import { groupBy } from "./groupBy";
import { GraphTag, toGraphTags } from "./toGraphTags";

export interface WebviewState {
	graph?: Graph;
	refs: Record<string, GraphTag[]>;
}

const api = acquireVsCodeApi();

export const createState = () => {
	const eventTarget = new StateEventTarget();

	let state = api.getState() ?? {
		graph: undefined,
		refs: {},
	};

	const setState = (s: WebviewState) => {
		state = s;
		api.setState(state);
		console.log("setState called");
	};

	return {
		eventTarget,
		dispatchMessage: (msg: FromRuntimeMessage) => {
			let dispatch = true;

			switch (msg.type) {
				case "GET_COMMITS": {
					setState({
						...state,
						graph: createGraphNodes(msg.commits),
					});
					break;
				}
				case "GET_REFS": {
					setState({
						...state,
						refs: Object.fromEntries(
							toGraphTags(groupBy(msg.refs, (r) => r.hash)),
						),
					});
					break;
				}
				default:
					dispatch = false;
			}

			if (dispatch) {
				eventTarget.dispatchEvent(new RenderEvent(state));
			}
		},
		dispatchEvent: (event: { type: "INIT" }) => {
			let dispatch = true;

			switch (event.type) {
				case "INIT":
					api.postMessage({ type: "INIT" });
					break;
			}

			if (dispatch) {
				eventTarget.dispatchEvent(new RenderEvent(state));
			}
		},
	};
};

class StateEventTarget extends EventTarget {
	addEventListener(
		type: "render",
		callback:
			| ((e: RenderEvent) => void)
			| { handleEvent(e: RenderEvent): void }
			| null,
		options?: boolean | AddEventListenerOptions | undefined,
	): void;
	addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: boolean | AddEventListenerOptions | undefined,
	): void {
		super.addEventListener(type, callback, options);
	}
}

class RenderEvent extends Event {
	constructor(public state: WebviewState) {
		super("render");
	}
}
