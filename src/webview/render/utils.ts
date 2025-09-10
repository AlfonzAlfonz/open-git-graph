import { RailId } from "../../runtime/GraphTabManager/createGraphNodes/Rails";

const colors = ["indigo", "pink", "emerald", "amber", "sky", "yellow", "red"];
export const getColor = (x: RailId) => colors[x % colors.length]!;

export const formatDate = (d: number) => {
	const [date, time] = new Date(d * 1000).toISOString().split("T");

	return `${date!} ${time!.slice(0, time!.length - ":##.000Z".length)}`;
};
