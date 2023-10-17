declare function acquireVsCodeApi(): {
	postMessage: (message: any) => Thenable<void>;
};

export const vscodeApi = acquireVsCodeApi();
