import { GitIndex } from "../../../../universal/git.js";
import { useWebviewStore } from "../../../state/index.js";
import { IndexInspector } from "../inspectors/IndexInspector.js";
import { renderRails } from "./renderRails.js";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow.js";

export const IndexGraphRow = ({ node, tags }: UseGraphRowOptions<GitIndex>) => {
	const { expandedCommit } = useWebviewStore();
	const { onClick, className } = useGraphRow({ node, tags });

	return (
		<>
			<tr onClick={onClick} class={className}>
				<td>{renderRails(node)}</td>
				<td colSpan={4}>
					<div class="flex gap-2 items-center">
						<p class="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
							Uncommited changes
						</p>
					</div>
				</td>
			</tr>
			{expandedCommit === "index" && <IndexInspector node={node} />}
		</>
	);
};
