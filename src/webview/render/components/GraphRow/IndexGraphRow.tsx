import { GitIndex } from "../../../../universal/git.js";
import { useWebviewStore } from "../../../state/index.js";
import { IndexInspector } from "../inspectors/IndexInspector.js";
import { renderRails } from "./renderRails.js";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow.js";

export const IndexGraphRow = ({
	node,
	tags,
	style,
}: UseGraphRowOptions<GitIndex> & { style: any }) => {
	const { expandedCommit } = useWebviewStore();
	const { onClick, className } = useGraphRow({ node, tags });

	return (
		<div style={style}>
			<div onClick={onClick} className={className}>
				<div>{renderRails(node)}</div>
				<div>
					<div className="flex gap-2 items-center">
						<p className="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
							Uncommited changes
						</p>
					</div>
				</div>
			</div>
			{expandedCommit === "index" && <IndexInspector node={node} />}
		</div>
	);
};
