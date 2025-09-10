import { GraphNode, createGraphNodes, withPrev } from ".";
import { GitCommit, GitIndex } from "../../../universal/git";

const commit = (
	hash: string,
	parents: string[],
	subject: string,
): GitCommit => ({
	hash,
	parents,
	subject,
	author: "",
	authorDate: 0,
	commitDate: 0,
	authorEmail: "",
	files: [],
});

test("fork", () => {
	const commits: GitCommit[] = [
		commit("1", ["2a"], "1"),
		commit("2a", ["3"], "2a"),
		commit("2b", ["3"], "2b"),
		commit("3", ["4"], "3"),
		commit("4", [], "4"),
	];

	const { nodes } = createGraphNodes(commits, undefined, []).toArray().at(-1)!;

	const [n1, n2a, n2b, n3, n4] = nodes as [
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
	];

	expect(n1.position).toBe(0);
	expect(n2a.position).toBe(0);
	expect(n2b.position).toBe(1);
	expect(n3.position).toBe(0);
	expect(n4.position).toBe(0);

	expect(n1.rails).toMatchObject([]);
	expect(n2a.rails).toMatchObject([0]);
	expect(n2b.rails).toMatchObject([0]);
	expect(n3.rails).toMatchObject([0, 1]);
	expect(n4.rails).toMatchObject([0]);

	expect(n1.forks).toMatchObject([0]);
	expect(n2a.forks).toMatchObject([]);
	expect(n2b.forks).toMatchObject([1]);
	expect(n3.forks).toMatchObject([1]);
	expect(n4.forks).toMatchObject([]);
});

test("merge", () => {
	const commits: GitCommit[] = [
		commit("1", ["2a", "2b"], "1"),
		commit("2a", ["3"], "2a"),
		commit("2b", ["3"], "2b"),
		commit("3", ["4"], "3"),
		commit("4", [], "4"),
	];

	const { nodes } = createGraphNodes(commits, undefined, []).toArray().at(-1)!;

	const [n1, n2a, n2b, n3, n4] = nodes as [
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
	];

	expect(n1.position).toBe(0);
	expect(n2a.position).toBe(0);
	expect(n2b.position).toBe(1);
	expect(n3.position).toBe(0);
	expect(n4.position).toBe(0);

	expect(n1.rails).toMatchObject([]);
	expect(n2a.rails).toMatchObject([0, 1]);
	expect(n2b.rails).toMatchObject([0, 1]);
	expect(n3.rails).toMatchObject([0, 1]);
	expect(n4.rails).toMatchObject([0]);

	expect(n1.forks).toMatchObject([0]);
	expect(n2a.forks).toMatchObject([]);
	expect(n2b.forks).toMatchObject([]);
	expect(n3.forks).toMatchObject([1]);
	expect(n4.forks).toMatchObject([]);

	expect(n1.merges).toMatchObject([1]);
	expect(n2a.merges).toMatchObject([]);
	expect(n2b.merges).toMatchObject([]);
	expect(n3.merges).toMatchObject([]);
	expect(n4.merges).toMatchObject([]);
});

test("merge2", () => {
	const commits: GitCommit[] = [
		commit("1", ["2a", "2b"], "1"),
		commit("2c", ["4"], "2c"),
		commit("2a", ["3"], "2a"),
		commit("2b", ["3"], "2b"),
		commit("3", ["4"], "3"),
		commit("4", [], "4"),
	];

	const { nodes } = createGraphNodes(commits, undefined, []).toArray().at(-1)!;

	const [n1, n2c, n2a, n2b, n3, n4] = nodes as [
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
	];

	expect(n1.position).toBe(0);
	expect(n2c.position).toBe(2);
	expect(n2a.position).toBe(0);
	expect(n2b.position).toBe(1);
	expect(n3.position).toBe(0);
	expect(n4.position).toBe(0);

	expect(n1.rails).toMatchObject([]);
	expect(n2c.rails).toMatchObject([0, 1]);
	expect(n2a.rails).toMatchObject([0, 1, 2]);
	expect(n2b.rails).toMatchObject([0, 1, 2]);
	expect(n3.rails).toMatchObject([0, 1, 2]);
	expect(n4.rails).toMatchObject([0, 2]);

	expect(n1.forks).toMatchObject([0]);
	expect(n2c.forks).toMatchObject([2]);
	expect(n2a.forks).toMatchObject([]);
	expect(n2b.forks).toMatchObject([]);
	expect(n3.forks).toMatchObject([1]);
	expect(n4.forks).toMatchObject([2]);

	expect(n1.merges).toMatchObject([1]);
	expect(n2c.merges).toMatchObject([]);
	expect(n2a.merges).toMatchObject([]);
	expect(n2b.merges).toMatchObject([]);
	expect(n3.merges).toMatchObject([]);
	expect(n4.merges).toMatchObject([]);
});

test.only("weird merge, do not create extra rail while merging", () => {
	const commits: GitCommit[] = [
		commit("a1", ["a2"], "a1"),
		commit("b1", ["b2"], "b1"),
		commit("a2", ["a3", "b2"], "a2"),
		commit("b2", ["b3"], "b2"),
		commit("a3", [], "a3"),
		commit("b3", [], "b3"),
	];

	const { nodes } = createGraphNodes(commits, undefined, []).toArray().at(-1)!;

	const [a1, b1, a2, b2, a3, b3] = nodes as [
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
	];

	expect(a1.position).toBe(0);
	expect(b1.position).toBe(1);
	expect(a2.position).toBe(0);
	expect(b2.position).toBe(1);
	expect(a3.position).toBe(0);
	expect(b3.position).toBe(1);

	expect(a1.rails).toEqual([]);
	expect(a1.forks).toEqual([0]);
	expect(a1.merges).toEqual([]);

	expect(b1.rails).toEqual([0]);
	expect(b1.forks).toEqual([1]);
	expect(b1.merges).toEqual([]);

	expect(a2.rails).toEqual([0, 1]);
	expect(a2.forks).toEqual([]);
	expect(a2.merges).toEqual([1]);

	expect(b2.rails).toEqual([0, 1]);
	expect(b2.forks).toEqual([]);
	expect(b2.merges).toEqual([]);

	expect(a3.rails).toEqual([0, 1]);
	expect(a3.forks).toEqual([]);
	expect(a3.merges).toEqual([]);

	expect(b3.rails).toEqual([0, 1]);
	expect(b3.forks).toEqual([]);
	expect(b3.merges).toEqual([]);
});

test("index", () => {
	const commits: GitCommit[] = [
		commit("1", ["2"], "1"),
		commit("2", ["3"], "2a"),
		commit("3", ["4"], "3"),
		commit("4", [], "4"),
	];

	const index: GitIndex = {
		parents: ["2"],
		tracked: [{} as never],
		untracked: [],
	};

	const { nodes } = createGraphNodes(commits, index, []).toArray().at(-1)!;

	const [i, n1, n2, n3, n4] = nodes as [
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
		GraphNode,
	];

	expect(i.position).toBe(0);
	expect(n1.position).toBe(1);
	expect(n2.position).toBe(0);
	expect(n3.position).toBe(0);
	expect(n4.position).toBe(0);

	expect(i.rails).toMatchObject([]);
	expect(n1.rails).toMatchObject([0]);
	expect(n2.rails).toMatchObject([0, 1]);
	expect(n3.rails).toMatchObject([0]);
	expect(n4.rails).toMatchObject([0]);

	expect(i.forks).toMatchObject([0]);
	expect(n1.forks).toMatchObject([1]);
	expect(n2.forks).toMatchObject([1]);
	expect(n3.forks).toMatchObject([]);
	expect(n4.forks).toMatchObject([]);
});

describe("withPrev", () => {
	test("multiple values", () => {
		const input = [1, 2, 3, 4, 5];

		const result = [...withPrev(input)];

		expect(result).toEqual([
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, undefined],
		]);
	});

	test("single value", () => {
		const input = [1];

		const result = [...withPrev(input)];

		expect(result).toEqual([[1, undefined]]);
	});

	test("empty", () => {
		const input: never[] = [];

		const result = [...withPrev(input)];

		expect(result).toEqual([]);
	});
});
