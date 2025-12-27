import { ComponentProps } from "react";

export const Checkbox = (props: ComponentProps<"input">) => {
	return (
		<div className="checkbox">
			<input
				{...props}
				type="checkbox"
				className={`input ${props.className ?? ""}`}
			/>
			<div className="icon">
				<span className="codicon codicon-check" />
			</div>
		</div>
	);
};
