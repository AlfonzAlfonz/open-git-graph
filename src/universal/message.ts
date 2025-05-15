import { Graph } from "../runtime/GraphTabManager/createGraphNodes";
import { GitRef } from "./git";

type GraphMessage = AnyRuntimeMessage<
	"graph",
	{
		graph: Graph;
		refs: GitRef[];
	}
>;

export type RuntimeMessage = GraphMessage;

interface AnyRuntimeMessage<TKey, T> {
	message: true;
	type: TKey;
	data: T;
}

export const runtimeMessage = <TKey extends RuntimeMessage["type"]>(
	type: TKey,
	data: (RuntimeMessage & { type: TKey })["data"],
): RuntimeMessage & { type: TKey } => ({
	message: true,
	type,
	data,
});

export const isRuntimeMessage = (x: unknown): x is RuntimeMessage =>
	typeof x === "object" &&
	!!x &&
	"message" in x &&
	x.message === true &&
	"type" in x &&
	typeof x.type === "string";
