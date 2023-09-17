import { GitCommit } from "../../types/git.js";
import { GraphNode, createGraphNodes } from "./createGraphNodes.js";

const commit = (
	hash: string,
	parents: string[],
	subject: string,
): GitCommit => ({
	hash,
	parents,
	subject,
	author: "",
	authorDate: "",
	authorEmail: "",
});

test("fork", () => {
	const commits: GitCommit[] = [
		commit("1", ["2a"], "1"),
		commit("2a", ["3"], "2a"),
		commit("2b", ["3"], "2b"),
		commit("3", ["4"], "3"),
		commit("4", [], "4"),
	];

	const { nodes } = createGraphNodes(commits);

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

	const { nodes } = createGraphNodes(commits);

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

	const { nodes } = createGraphNodes(commits);

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
