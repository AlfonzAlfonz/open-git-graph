import { createContext, useContext } from "react";
import { GraphState } from "../../../universal/protocol";
import { Graph } from "../../../runtime/GraphTabManager/createGraphNodes";
import { GitRef } from "../../../universal/git";

export interface IAppContext extends Partial<GraphState> {
	repoPath?: string;
	graph?: Graph;
	refs?: GitRef[];
}

export const AppContext = createContext<IAppContext>(null!);

export const useAppContext = () => useContext(AppContext);
