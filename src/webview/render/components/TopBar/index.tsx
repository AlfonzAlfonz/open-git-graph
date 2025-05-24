import { useAppContext } from "../AppContext";

export const TopBar = () => {
	const { actions } = useAppContext();

	return (
		<div className="top-bar flex justify-between items-center px-3">
			<div>Branch: master</div>

			<div className="flex items-center">
				<button className="icon-button mr-[4px]">
					<span className="codicon codicon-search" />
				</button>
				<button className="icon-button mr-[4px]">
					<span
						className="codicon codicon-refresh"
						onClick={() => actions.reload()}
					/>
				</button>
			</div>
		</div>
	);
};
