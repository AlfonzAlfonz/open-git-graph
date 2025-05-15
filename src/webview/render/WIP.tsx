import { useAppContext } from "./components/AppContext";

export const WIP = () => {
	const { graph } = useAppContext();

	return (
		<div>
			WIP
			<pre>{JSON.stringify(graph, null, 2)}</pre>
		</div>
	);
};
