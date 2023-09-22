import { create } from "../zustand.js";
import { GitCommit } from "../../types/git.js";
import {
	FromRuntimeMessage,
	FromWebviewMessage,
} from "../../types/messages.js";
import { Graph, createGraphNodes } from "./createGraphNodes/index.js";
import { groupBy } from "./groupBy.js";
import { GraphTag, toGraphTags } from "./toGraphTags.js";
import { Request, req } from "./req.js";

const api = acquireVsCodeApi();

interface Store {
	graph: Request<Graph>;
	tags: Request<Record<string, GraphTag[]>>;

	commits: Record<string, Request<GitCommit>>;

	dispatch: (msg: FromWebviewMessage) => unknown;
}

export const useStore = create<Store>((set) => {
	const state = api.getState();
	return {
		graph: state?.graph ?? req.empty(),
		tags: state?.tags ?? req.empty(),
		commits: state?.commits ?? {},

		dispatch: (msg) => {
			switch (msg.type) {
				case "INIT":
					set({ graph: req.waiting(), tags: req.waiting() });
					break;
			}
			api.postMessage(msg);
		},
	};
});

export const receive = (msg: FromRuntimeMessage) => {
	switch (msg.type) {
		case "APPEND_COMMITS": {
			useStore.setState((s) => ({
				graph: req.done(createGraphNodes(msg.commits, s.graph.data)),
			}));
			break;
		}
		case "GET_REFS": {
			useStore.setState({
				tags: req.done(
					Object.fromEntries(toGraphTags(groupBy(msg.refs, (r) => r.hash))),
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
	getState: () => Omit<Store, "dispatch"> | null;
	postMessage: (message: FromWebviewMessage) => void;
	setState: (state: Omit<Store, "dispatch">) => void;
};
