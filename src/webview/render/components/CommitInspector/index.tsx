import { GitCommitFileMode } from "../../../../types/git.js";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { useWebviewStore } from "../../../state/index.js";
import { renderEmptyRails } from "../GraphRow/renderRails.js";

export const CommitInspector = ({ node }: { node: GraphNode }) => {
	const { dispatch } = useWebviewStore();

	const { commit } = node;

	return (
		<tr class={"commit-inspector"}>
			<td>{renderEmptyRails(node, 200)}</td>
			<td colSpan={4}>
				<div class="flex leading-normal h-[200px] overflow-scroll">
					<div>
						<div>{commit.hash}</div>
						<div>{commit.subject}</div>
						<div>{commit.author}</div>
					</div>
					<div>
						<ul class="list-none">
							{commit.files.map((f, i) => (
								<li
									key={f.path}
									onClick={() =>
										dispatch({
											type: "SHOW_DIFF",
											path: f.path,
											a: commit.parents[0],
											b: commit.hash,
										})
									}
									class={`flex gap-2 p-1 ${fileModeColors[f.mode] ?? "white"}`}
								>
									<span>{f.mode}</span>
									<span>{f.path}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</td>
		</tr>
	);
};

const fileModeColors: Record<GitCommitFileMode, string> = {
	A: "text-green-900",
	D: "text-rose-950",
	M: "text-yellow-600",
	R: "text-lime-900",
	U: "text-stone-500",
};
