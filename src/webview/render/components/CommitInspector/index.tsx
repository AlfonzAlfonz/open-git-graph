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
						<ul>
							{commit.files.map((f, i) => (
								<li
									key={f.filename}
									onClick={() =>
										dispatch({
											type: "SHOW_DIFF",
											a: [commit.parents[0]!, f.filename],
											b: [commit.hash, f.filename],
										})
									}
								>
									<span>{f.mode}</span>
									{f.filename}
								</li>
							))}
						</ul>
					</div>
				</div>
			</td>
		</tr>
	);
};
