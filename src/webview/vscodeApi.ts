declare function acquireVsCodeApi(): {
	postMessage: (message: any) => Thenable<void>;
	getState: () => VscodeState | undefined;
	setState: (state: VscodeState) => void;
};

export type VscodeState = {
	queryStore: Record<string, string | undefined>;
};

export const vscodeApi = acquireVsCodeApi();

export const vscodeStorage = {
	getItem(key: string): string | null {
		return vscodeApi.getState()?.queryStore[key] ?? null;
	},
	setItem(key: string, value: string): void {
		const old = vscodeApi.getState();
		vscodeApi.setState({
			...old,
			queryStore: { ...old?.queryStore, [key]: value },
		});
	},
	removeItem(key: string): void {
		const old = vscodeApi.getState();
		vscodeApi.setState({
			...old,
			queryStore: { ...old?.queryStore, [key]: undefined },
		});
	},
};
