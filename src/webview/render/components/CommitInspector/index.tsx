import { GitFileMode } from "../../../../types/git.js";
import { GraphNode } from "../../../state/createGraphNodes/index.js";
import { useWebviewStore } from "../../../state/index.js";
import { renderEmptyRails } from "../GraphRow/renderRails.js";

export const CommitInspector = ({ node }: { node: GraphNode }) => {
	const { dispatch } = useWebviewStore();

	const { commit } = node;

	return (
		<tr class="commit-inspector">
			<td>{renderEmptyRails(node, 200)}</td>
			<td colSpan={4}>
				<div class="flex leading-normal h-[200px] overflow-auto w-full">
					<div class="w-1/2 p-1 overflow-hidden text-ellipsis">
						<div>
							<span class="font-bold">Commit: </span>
							<span>{commit.hash}</span>
						</div>
						<div>
							<span class="font-bold">Author: </span>
							<span>{commit.author}</span>
						</div>
						<br />
						<div>{commit.subject}</div>
					</div>
					<div class="w-1/2 p-1 overflow-y-auto overflow-x-hidden text-ellipsis">
						<ul class="files list-none">
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
									<div class="flex justify-between w-full">
										<span>{f.path}</span>
										<span class="px-1">{f.mode}</span>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</td>
		</tr>
	);
};

const fileModeColors: Record<GitFileMode, string> = {
	M: "modified",
	T: "type-modified",
	A: "added",
	D: "deleted",
	R: "renamed",
	C: "copied",
	U: "updated",
	"!": "ignored",
	"?": "untracked",
};
