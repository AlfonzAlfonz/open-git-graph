import { GitIndex } from "../../../../universal/git";
import { IndexInspector } from "../inspectors/IndexInspector";
import { GraphRow } from "./GraphRow";
import { renderRails } from "./renderRails";
import { UseGraphRowOptions, useGraphRow } from "./useGraphRow";

export const IndexGraphRow = ({
	node,
	tags,
	style,
}: UseGraphRowOptions<GitIndex> & { style: any }) => {
	const { open, onClick } = useGraphRow({ node, tags });

	return (
		<div style={style}>
			<GraphRow
				// div props
				className="graph-row"
				onClick={onClick}
				// content
				graph={renderRails(node)}
				info="Uncommitted changes"
			/>
			{open && <IndexInspector node={node} />}
		</div>
	);
};
