import { GitIndex } from "../../../../universal/git.js";
import { IndexInspector } from "../inspectors/IndexInspector.js";
import { renderRails } from "./renderRails.js";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow.js";

export const IndexGraphRow = ({
	node,
	tags,
	style,
}: UseGraphRowOptions<GitIndex> & { style: any }) => {
	const { open, ...props } = useGraphRow({ node, tags });

	return (
		<div style={style}>
			<div {...props}>
				<div className="h-[26px]">{renderRails(node)}</div>
				<div>
					<div className="flex gap-2 items-center">
						<p className="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
							Uncommited changes
						</p>
					</div>
				</div>
			</div>
			{open && <IndexInspector node={node} />}
		</div>
	);
};
