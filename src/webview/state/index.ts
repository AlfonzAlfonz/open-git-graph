import { GitCommit } from "../../types/git.js";
import {
	FromRuntimeMessage,
	FromWebviewMessage,
} from "../../types/messages.js";
import { Req, req } from "../../types/req.js";
import { Graph, createGraphNodes } from "./createGraphNodes/index.js";
import { groupBy } from "./groupBy.js";
import { GraphTag, toGraphTags } from "./toGraphTags.js";
import { create } from "./zustand.js";

const api = acquireVsCodeApi();

interface WebviewStore {
	graph: Req<Graph>;
	tags: Req<Record<string, GraphTag[]>>;

	commits: Record<string, Req<GitCommit>>;

	dispatch: (msg: FromWebviewMessage) => unknown;
}

export const useWebviewStore = create<WebviewStore>((set) => {
	const state = api.getState();
	return {
		graph: state?.graph ?? req.empty(),
		tags: state?.tags ?? req.empty(),
		commits: state?.commits ?? {},

		dispatch: (msg) => {
			switch (msg.type) {
				case "INIT":
					set({
						graph: req.waiting(state?.graph.data),
						tags: req.waiting(state?.tags.data),
					});
					break;
			}
			api.postMessage(msg);
		},
	};
});

export const receive = (msg: FromRuntimeMessage) => {
	switch (msg.type) {
		case "APPEND_COMMITS": {
			useWebviewStore.setState((s) => ({
				graph: req.map(msg.commits, (c) => createGraphNodes(c, s.graph.data)),
			}));
			break;
		}
		case "GET_REFS": {
			useWebviewStore.setState({
				tags: req.map(msg.refs, (refs) =>
					Object.fromEntries(toGraphTags(groupBy(refs, (r) => r.hash))),
				),
			});
			break;
		}
		default: {
			msg satisfies never;
		}
	}
};

declare function acquireVsCodeApi(): {
	getState: () => Omit<WebviewStore, "dispatch"> | null;
	postMessage: (message: FromWebviewMessage) => void;
	setState: (state: Omit<WebviewStore, "dispatch">) => void;
};
