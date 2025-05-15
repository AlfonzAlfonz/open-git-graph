import { useEffect, useState } from "react";
import { isBridgeResponse } from "../../universal/bridge";
import { WebToRuntimeBridge } from "../../universal/protocol";
import { bridge } from "../bridge";
import { IAppContext } from "./components/AppContext";
import { isRuntimeMessage } from "../../universal/message";
import { Graph } from "../../runtime/GraphTabManager/createGraphNodes";

interface App {
	state: IAppContext;
}

export const useApp = (): App => {
	const [repoPath, setRepoPath] = useState<string>();
	const [graph, setGraph] = useState<Graph>();

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
						break;
				}
			}
		});

		bridge.ready(repoPath).then(setRepoPath);
	}, []);

	return {
		state: {
			repoPath,
			graph,
			expandedCommit: undefined,
			scroll: 0,
			refs: [],
		},
	};
};
