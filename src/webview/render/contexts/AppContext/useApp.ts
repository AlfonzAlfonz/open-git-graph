import { fork } from "@alfonz/async/fork";
import debounce from "lodash-es/debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from ".";
import { Graph } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { GitRef, GitRefFullname } from "../../../../universal/git";
import { GraphTabState } from "../../../../universal/protocol";
import { bridge, messageQueue } from "../../../bridge";
import { LaunchpadInput } from "../../components/TopBar/Launchpad";
import { Resource } from "../../../state/Resource";

export type AppValue = ReturnType<typeof useApp>;

export const useApp = () => {
	if (process.env.NODE_ENV !== "production") {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const ctx = useAppContext();
		if (ctx) {
			throw new Error("Nested useApp()");
		}
	}

	const [state, setState] = useState<GraphTabState>();

	const currentGraphRef = useRef<Graph>();

	const [graph, setGraph] = useState<Graph>();
	const [refs, setRefs] = useState<Resource<GitRef[]>>(Resource.loading());
	const [currentBranch, setCurrentBranch] = useState<string | undefined>();

	const launchpadInputRef = useRef<LaunchpadInput>();

	useEffect(() => {
		const controller = new AbortController();

		void fork(async () => {
			for await (const message of messageQueue.iterator) {
				// TODO: breaking after receiving message will cause the message to be dropped
				if (controller.signal.aborted) break;

				switch (message.type) {
					case "graph":
						currentGraphRef.current = message.data.graph;
						setGraph(message.data.graph);
						setRefs(Resource.ready(message.data.refs));
						setCurrentBranch(message.data.currentBranch);
						setState({ ...message.data.state });
						break;
					case "graph-poll":
						setGraph(message.data.graph);
						break;
					case "open-search":
						launchpadInputRef.current?.focus();
						break;
					default:
						message satisfies never;
				}
			}
		});

		void bridge.ready(state?.repoPath).then(setState);

		return () => {
			controller.abort();
		};
	}, [state?.repoPath]);

	const actions = useMemo(
		() => ({
			expandCommit: (value: string | undefined) => {
				void bridge.expandCommit(value);
				setState((s) => ({ ...s!, expandedCommit: value }));
			},
			scroll: debounce((value: number) => {
				void bridge.scroll(value);
				setState((s) => ({ ...s!, scroll: value }));
			}, 100),
			reload: async () => {
				setGraph(undefined);
				setRefs(Resource.loading());
				await bridge.reload();
			},
			fetch: async () => {
				await bridge.fetch();
			},
			setRefs: async (r: GitRefFullname[]) => {
				await bridge.setRefs(r);
			},
		}),
		[],
	);

	return useMemo(() => {
		return {
			...state,
			graph,
			refs,
			currentBranch,

			currentGraphRef,

			launchpadInputRef,

			actions,
		};
	}, [actions, currentBranch, graph, refs, state]);
};
