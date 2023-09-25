import { createGraphPanel } from "../panel";
import { command } from "../utils";

export const graphCommand = command({
	id: "open-git-graph.graph",
	command: (context, store) => () => {
		createGraphPanel(context, store.ensure());
	},
});
