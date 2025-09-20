import { fork } from "@alfonz/async/fork";
import debounce from "lodash-es/debounce";
import { useEffect, useRef, useState } from "react";
import { Graph } from "../../runtime/GraphTabManager/createGraphNodes";
import {
	GitCommit,
	GitRef,
	GitRefBranch,
	GitRefTag,
} from "../../universal/git";
import { GraphTabState } from "../../universal/protocol";
import { bridge, messageQueue } from "../bridge";

export type App = ReturnType<typeof useApp>;

type Search = {
	query: string;

	currentResult: { resultIndex: number; rowIndex: number } | undefined;
	hashes: string[];
};

export const useApp = () => {
	const [state, setState] = useState<GraphTabState>();

	const currentGraphRef = useRef<Graph>();

	const [graph, setGraph] = useState<Graph>();
	const [refs, setRefs] = useState<GitRef[]>();
	const [currentBranch, setCurrentBranch] = useState<string | undefined>();

	const [searchResults, setSearchResults] = useState<Search>();

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

		void bridge.ready(state?.repoPath).then(setState);

		return () => {
			controller.abort();
		};
	}, []);

	const selectNextResult = async (
		currentResult: Search["currentResult"] | undefined,
		hashes: string[],
	) => {
		hashes = currentResult
			? hashes.slice(currentResult.resultIndex + 1)
			: hashes;

		let rowIndex: number = -1;

		while (true) {
			if (!currentGraphRef.current) break;

			rowIndex = currentGraphRef.current.nodes.findIndex(
				(x) => "hash" in x.commit && hashes.includes(x.commit.hash),
			);

			if (rowIndex !== -1) break;

			if ((await bridge.pollGraphData()).done) break;
		}

		if (currentGraphRef.current && rowIndex !== -1) {
			const node = currentGraphRef.current.nodes[rowIndex]!;

			return {
				resultIndex: hashes.indexOf((node?.commit as GitCommit).hash),
				rowIndex,
			};
		}

		return undefined;
	};

	return {
		state: {
			...state,
			graph,
			refs,
			currentBranch,

			searchResults,

			actions: {
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
					setRefs(undefined);
					await bridge.reload();
				},
				fetch: async () => {
					await bridge.fetch();
				},
				setRefs: async (r: (GitRefBranch | GitRefTag)[]) => {
					await bridge.setRefs(r);
				},
				search: async (query: string) => {
					const hashes = await bridge.search(query);

					let currentResult = await selectNextResult(undefined, hashes);

					setSearchResults({ query, currentResult, hashes });
				},
				clearSearch: () => setSearchResults(undefined),
			},
		},
	};
};
