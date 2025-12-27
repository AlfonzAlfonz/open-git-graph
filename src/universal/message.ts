import { Graph } from "../runtime/GraphTabManager/createGraphNodes";
import { GitRef } from "./git";
import { GraphTabState } from "./protocol";

type GraphMessage = AnyRuntimeMessage<
	"graph",
	{
		graph: Graph;
		refs: GitRef[];
		currentBranch: string | undefined;
		state: GraphTabState;
	}
>;

type GraphPollMessage = AnyRuntimeMessage<
	"graph-poll",
	{
		graph: Graph;
	}
>;

type OpenSearchMessage = AnyRuntimeMessage<"open-search", {}>;

export type RuntimeMessage =
	| GraphMessage
	| GraphPollMessage
	| OpenSearchMessage;

interface AnyRuntimeMessage<TKey, T> {
	message: true;
	type: TKey;
	data: T;
}

export const runtimeMessage = <TKey extends RuntimeMessage["type"]>(
	type: TKey,
	data: (RuntimeMessage & { type: TKey })["data"],
): RuntimeMessage & { type: TKey } =>
	({
		message: true,
		type,
		data,
	}) as RuntimeMessage & { type: TKey };

export const isRuntimeMessage = (x: unknown): x is RuntimeMessage =>
	typeof x === "object" &&
	!!x &&
	"message" in x &&
	x.message === true &&
	"type" in x &&
	typeof x.type === "string";
