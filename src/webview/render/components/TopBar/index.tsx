import { useAppContext } from "../../contexts/AppContext";

export const TopBar = () => {
	const { actions, currentBranch } = useAppContext();

	return (
		<div className="top-bar flex justify-between items-center px-3">
			<div>
				Branch:{" "}
				{currentBranch === undefined ? <em>DETACHED</em> : currentBranch}
			</div>

			<div className="flex items-center">
				<button className="icon-button mr-[4px]" title="Search">
					<span className="codicon codicon-search" />
				</button>
				<button className="icon-button mr-[4px]" title="Fetch">
					<span
						className="codicon codicon-git-fetch"
						onClick={() => actions.reload()}
					/>
				</button>
				<button className="icon-button mr-[4px]" title="Reload">
					<span
						className="codicon codicon-refresh"
						onClick={() => actions.reload()}
					/>
				</button>
			</div>
		</div>
	);
};
