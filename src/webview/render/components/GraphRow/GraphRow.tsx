import { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
	graph: ReactNode;
	tags?: ReactNode;
	info?: ReactNode;
	author?: ReactNode;
	date?: ReactNode;
	hash?: ReactNode;
}

export const GraphRow = ({
	graph,
	tags,
	info,
	author,
	date,
	hash,
	...props
}: Props) => {
	return (
		<div {...props}>
			<div className="graph-col graph">{graph}</div>
			<div className="graph-col info flex gap-2 items-center">
				{tags}
				{info && (
					<p className="inline-block whitespace-nowrap text-ellipsis overflow-hidden leading-tight flex-grow-1">
						{info}
					</p>
				)}
			</div>
			<div className="graph-col author text-ellipsis">{author}</div>
			<div className="graph-col date text-ellipsis">{date}</div>
			<div className="graph-col hash text-ellipsis">{hash}</div>
		</div>
	);
};
