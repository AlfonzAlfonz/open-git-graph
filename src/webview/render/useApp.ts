import { useEffect, useState } from "react";
import { Graph } from "../../runtime/GraphTabManager/createGraphNodes";
import { isBridgeResponse } from "../../universal/bridge";
import { GitRef } from "../../universal/git";
import { isRuntimeMessage } from "../../universal/message";
import { GraphTabState, WebToRuntimeBridge } from "../../universal/protocol";
import { bridge } from "../bridge";
import { IAppContext } from "./components/AppContext";
import debounce from "lodash-es/debounce";

interface App {
	state: IAppContext;
}

export const useApp = (): App => {
	const [state, setState] = useState<GraphTabState>();

	const [graph, setGraph] = useState<Graph>();
	const [refs, setRefs] = useState<GitRef[]>();

	useEffect(() => {
		window.addEventListener("message", (e) => {
			if (isBridgeResponse<WebToRuntimeBridge>(e.data)) {
				return;
			}

			if (isRuntimeMessage(e.data)) {
				switch (e.data.type) {
					case "graph":
						setGraph(e.data.data.graph);
						setRefs(e.data.data.refs);
						break;
					case "graph-poll":
						setGraph(e.data.data.graph);
						break;
					default:
						e.data satisfies never;
				}
			}
		});

		bridge.ready(state?.repoPath).then(setState);
	}, []);

	return {
		state: {
			...state,
			graph,
			refs,
			actions: {
				expandCommit: (value) => {
					bridge.expandCommit(value);
					setState((s) => ({ ...s!, expandedCommit: value }));
				},
				scroll: debounce((value: number) => {
					bridge.scroll(value);
					setState((s) => ({ ...s!, scroll: value }));
				}, 100),
			},
		},
	};
};
