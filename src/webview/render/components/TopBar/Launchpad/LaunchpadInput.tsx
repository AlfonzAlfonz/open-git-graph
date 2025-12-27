import { KeyboardEvent, MutableRefObject, useContext, useId } from "react";
import { RefBadge } from "../../RefBadge";
import { TargetLaunchpadContext, PrimaryLaunchpadContext } from "./context";

interface Props {
	containerRef: MutableRefObject<HTMLDivElement | null>;

	inputProps: {
		ref: MutableRefObject<HTMLInputElement>;
		onFocus: () => void;
		onBlur: () => void;
		onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
	};

	containerProps: {
		onClick: () => void;
	};
}

export const LaunchpadInput = ({
	containerRef,
	containerProps,

	inputProps,
}: Props) => {
	const { selected, clearSelected } = useContext(PrimaryLaunchpadContext);
	const target = useContext(TargetLaunchpadContext);

	const id = useId();

	return (
		<div className={`launchpad`} ref={containerRef}>
			<div
				className="input p-[8.5px] min-h-[35px] text-base"
				{...containerProps}
			>
				<>
					<>
						{selected.map((badge, i) =>
							badge.type === "search" ? (
								<div
									key={i}
									aria-label={`Search for: ${badge.value}`}
									className="flex items-center r-primary"
								>
									<span className="codicon codicon-search" /> Search for{" "}
									{badge.value}
								</div>
							) : badge.type === "category" ? (
								<div
									key={i}
									aria-label={badge.label}
									className="flex items-center r-primary"
								>
									<RefBadge
										label={badge.label}
										type="category"
										endDecorators={[
											{
												label: (
													<div
														aria-label="Remove"
														className="flex items-center bg-transparent border-none outline-none color-inherit cursor-pointer"
														onClick={() =>
															target.dispatch("toggleSelect", badge.id)
														}
													>
														<span
															className="codicon codicon-close -mx-0.5"
															style={{ fontSize: "0.9rem" }}
														/>
													</div>
												),
											},
										]}
									/>
								</div>
							) : (
								<div
									key={i}
									aria-label={badge.label}
									className="flex items-center r-primary"
								>
									<RefBadge
										label={badge.label}
										type={badge.type}
										endDecorators={[
											{
												label: (
													<div
														aria-label="Remove"
														className="flex items-center bg-transparent border-none outline-none color-inherit cursor-pointer"
														onClick={() =>
															target.dispatch("toggleSelect", badge.id)
														}
													>
														<span
															className="codicon codicon-close -mx-0.5"
															style={{ fontSize: "0.9rem" }}
														/>
													</div>
												),
											},
										]}
									/>
								</div>
							),
						)}
					</>
					<input
						id={id}
						className="min-w-12 h-[18px] flex-1 bg-transparent !border-none !outline-none color-inherit"
						placeholder="Search..."
						{...inputProps}
					/>
				</>
			</div>
			<div className="controls flex items-center pr-2">
				{clearSelected && (
					<div
						className="flex cursor-pointer h-10 w-6 items-center justify-center bg-transparent p-0 border-none text-inherit"
						aria-label="Clear selection"
						onClick={clearSelected}
					>
						<span className="codicon codicon-clear-all" />
					</div>
				)}
			</div>
		</div>
	);
};
