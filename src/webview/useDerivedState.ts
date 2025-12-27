import { DependencyList, useEffect, useState } from "react";

export const useDerivedState = <T>(init: () => T, deps: DependencyList) => {
	const [state, setState] = useState(init);

	useEffect(() => {
		setState(init());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return [state, setState] as const;
};
