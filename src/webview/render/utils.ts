import { RailId } from "../../runtime/GraphTabManager/createGraphNodes/Rails";

const colors = ["indigo", "pink", "emerald", "amber", "sky", "yellow", "red"];
export const getColor = (x: RailId) => colors[x % colors.length]!;
