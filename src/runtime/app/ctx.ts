import { DI, di } from "../../universal/di/di";
import { GitService, gitSaga } from "./git/git";
import { GraphPanelsService, graphPanelsSaga } from "./graphPanels/graphPanels";
import { LoggerService, loggerSaga } from "./logger";
import * as vscode from "vscode"

interface RuntimeServices {
	git: GitService;
	graphPanels: GraphPanelsService;
	logger: LoggerService;
}

export type RuntimeCtx = DI<RuntimeServices>;

export const createRuntimeCtx = (context: vscode.ExtensionContext) =>
	di<RuntimeServices>({
		git: gitSaga,
		graphPanels: graphPanelsSaga(context),
		logger: loggerSaga,
	});
