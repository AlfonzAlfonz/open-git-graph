import { fork } from "@alfonz/async/fork";
import debounce from "lodash-es/debounce";
import { useEffect, useState } from "react";
import { Graph } from "../../runtime/GraphTabManager/createGraphNodes";
import { GitRef } from "../../universal/git";
import { GraphTabState } from "../../universal/protocol";
import { bridge, messageQueue } from "../bridge";
import { IAppContext } from "./components/AppContext";

interface App {
	state: IAppContext;
}

export const useApp = (): App => {
	const [state, setState] = useState<GraphTabState>();

	const [graph, setGraph] = useState<Graph>();
	const [refs, setRefs] = useState<GitRef[]>();
	const [currentBranch, setCurrentBranch] = useState<string | undefined>();

	useEffect(() => {
		const controller = new AbortController();

		fork(async () => {
			for await (const message of messageQueue.iterator) {
				// TODO: breaking after receiving message will cause the message to be dropped
				if (controller.signal.aborted) break;

				switch (message.type) {
					case "graph":
						setGraph(message.data.graph);
						setRefs(message.data.refs);
						setCurrentBranch(message.data.currentBranch);
						break;
					case "graph-poll":
						setGraph(message.data.graph);
						break;
					default:
						message satisfies never;
				}
			}
		});

		bridge.ready(state?.repoPath).then(setState);

		return () => {
			controller.abort();
		};
	}, []);

	return {
		state: {
			...state,
			graph,
			refs,
			currentBranch,
			actions: {
				expandCommit: (value) => {
					bridge.expandCommit(value);
					setState((s) => ({ ...s!, expandedCommit: value }));
				},
				scroll: debounce((value: number) => {
					bridge.scroll(value);
					setState((s) => ({ ...s!, scroll: value }));
				}, 100),
				reload: async () => {
					setGraph(undefined);
					setRefs(undefined);
					await bridge.reload();
				},
			},
		},
	};
};
