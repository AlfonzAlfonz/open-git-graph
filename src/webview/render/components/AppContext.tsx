import { createContext, useContext } from "react";
import { GraphTabState } from "../../../universal/protocol";
import { Graph } from "../../../runtime/GraphTabManager/createGraphNodes";
import { GitRef } from "../../../universal/git";

export interface IAppContext extends Partial<GraphTabState> {
	repoPath?: string;
	graph?: Graph;
	refs?: GitRef[];
	currentBranch: string | undefined;

	actions: {
		expandCommit: (value: string | undefined) => void;
		scroll: (value: number) => void;
		reload: () => Promise<void>;
		fetch: () => Promise<void>;
	};
}

export const AppContext = createContext<IAppContext>(null!);

export const useAppContext = () => useContext(AppContext);
