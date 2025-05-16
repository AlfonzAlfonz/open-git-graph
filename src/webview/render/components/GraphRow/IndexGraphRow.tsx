import { GitIndex } from "../../../../universal/git";
import { IndexInspector } from "../inspectors/IndexInspector";
import { renderRails } from "./renderRails";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow";

export const IndexGraphRow = ({
	node,
	tags,
	style,
}: UseGraphRowOptions<GitIndex> & { style: any }) => {
	const { open, ...props } = useGraphRow({ node, tags });

	return (
		<div style={style}>
			<div {...props}>
				<div
					className="h-[26px] pl-3"
					style={{ flex: "var(--table-graph-width) 1 0px" }}
				>
					{renderRails(node)}
				</div>
				<div
					className="flex gap-2 items-center"
					// TODO: stretch this automatically
					style={{ flex: "var(--table-index-width) 1 0px" }}
				>
					<p className="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
						Uncommitted changes
					</p>
				</div>
			</div>
			{open && <IndexInspector node={node} />}
		</div>
	);
};
