import { useEffect, useState } from "react";
import { Graph } from "../../runtime/GraphTabManager/createGraphNodes";
import { isBridgeResponse } from "../../universal/bridge";
import { GitRef } from "../../universal/git";
import { isRuntimeMessage } from "../../universal/message";
import { GraphState, WebToRuntimeBridge } from "../../universal/protocol";
import { bridge } from "../bridge";
import { IAppContext } from "./components/AppContext";

interface App {
	state: IAppContext;
}

export const useApp = (): App => {
	const [state, setState] = useState<GraphState>();

	const [graph, setGraph] = useState<Graph>();
	const [refs, setRefs] = useState<GitRef[]>();

	useEffect(() => {
		window.addEventListener("message", (e) => {
			if (isBridgeResponse<WebToRuntimeBridge>(e.data)) {
				return;
			}

			if (isRuntimeMessage(e.data)) {
				console.log("message", e.data);
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
		},
	};
};
