import { useAppContext } from "../../contexts/AppContext";
import Launchpad from "./Launchpad";

export const TopBar = () => {
	const { actions, currentBranch } = useAppContext();

	return (
		<div className="top-bar flex justify-between items-center px-3 relative">
			<div className="flex items-center self-stretch gap-1 pl-1">
				<span className="codicon codicon-git-branch !text-base" />{" "}
				{currentBranch === undefined ? <em>DETACHED</em> : currentBranch}
			</div>

			<div className="absolute top-0 left-[15%] right-[15%]">
				<Launchpad />
			</div>

			<div className="flex items-center">
				<button className="icon-button mr-[4px]" title="Fetch">
					<span
						className="codicon codicon-repo-fetch"
						onClick={() => actions.fetch()}
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
