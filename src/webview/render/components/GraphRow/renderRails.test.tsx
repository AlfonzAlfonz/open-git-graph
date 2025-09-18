import { GraphNode } from "../../../../runtime/GraphTabManager/createGraphNodes";
import { RailId } from "../../../../runtime/GraphTabManager/createGraphNodes/Rails";
import { renderEmptyRails } from "./renderRails";

test("renderEmptyRails - merge commit", () => {
	const data = {
		commit: {
			hash: "d4ab50fdf4ab059d64509bf8c3e95d0a7ee05def",
			parents: [
				"1bca653f2aedb5843a15fa6ff806d415dc15647a",
				"5b2c1d02538dc890a22968454f7e92d8932d66d5",
			],
			subject: "Merge branch 'feature' into 'master'",
			author: "",
			authorDate: 1746614032,
			authorEmail: "",
			commitDate: 1746614032,
			files: [],
		},
		position: 1 as RailId,
		rails: [0, 1, 2] as RailId[],
		forks: [2] as RailId[],
		merges: [3] as RailId[],
	} satisfies GraphNode;

	const result = renderEmptyRails(data, 20);

	const colors: string[] = result.props.children.map(
		(e: any) => e.props.className,
	);

	expect(colors).toEqual(["indigo", "pink", "amber"]);
});

test("renderEmptyRails - merge commit 2", () => {
	const data = {
		commit: {
			hash: "b84b5dadc8e2da8adad210212914f40ed939264d",
			parents: [
				"254318943358da9c53eb1230fc59fdaeaee3463d",
				"246cd7a90fac3483532856c704ff849397084e25",
			],
			subject: "Merge branch 'feature' into 'master'",
			author: "",
			authorDate: 1743525680,
			authorEmail: "",
			commitDate: 1743525680,
			files: [],
		},
		position: 0 as RailId,
		rails: [0, 18, 19, 20] as RailId[],
		forks: [18] as RailId[],
		merges: [21] as RailId[],
	} satisfies GraphNode;

	const result = renderEmptyRails(data, 20);

	const colors: string[] = result.props.children.map(
		(e: any) => e.props.className,
	);

	expect(colors).toEqual(["indigo", "yellow", "red", "indigo"]);
});

test("renderEmptyRails - index", () => {
	const data = {
		commit: {
			hash: "63952603e189de424c9d012103736bb2587cb4c0",
			parents: ["4703e1e484e09f873dcf04211873beb0db501ccf"],
			subject: "idk",
			author: "",
			authorDate: 1747354764,
			authorEmail: "",
			commitDate: 1747354764,
			files: [],
		},
		position: 0 as RailId,
		rails: [] as RailId[],
		forks: [0] as RailId[],
		merges: [] as RailId[],
	} satisfies GraphNode;

	const result = renderEmptyRails(data, 20);

	const colors: string[] = result.props.children.map(
		(e: any) => e.props.className,
	);

	expect(colors).toEqual(["indigo"]);
});
