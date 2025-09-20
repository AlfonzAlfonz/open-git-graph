import { HTMLAttributes, ReactNode } from "react";
import { GitRef } from "../../../universal/git";

interface Props extends HTMLAttributes<HTMLDivElement> {
	label: string;
	type: GitRef["type"] | "category" | "search";
	endDecorators?: { label: ReactNode; context?: any }[];

	active?: boolean;

	context?: unknown;
}

export const RefBadge = ({
	label,
	type,
	endDecorators,
	context,
	active,
	onClick,
	onDoubleClick,
}: Props) => {
	return (
		<div
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			className={`ref-badge ${type} ${active ? "active" : ""}`}
			data-vscode-context={context}
		>
			<div className="content">{label}</div>
			{endDecorators?.map((d, i) => (
				<div
					key={i}
					className={"end-decorator"}
					data-vscode-context={d.context}
				>
					{d.label}
				</div>
			))}
		</div>
	);
};
