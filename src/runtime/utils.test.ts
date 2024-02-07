import { batch, buffer, command, only } from "./utils";

test("buffer", async () => {
	async function* oneToFive() {
		yield 1;
		yield 2;
		yield 3;
		yield 4;
		yield 5;
	}

	const result = await buffer(oneToFive());

	expect(result).toMatchObject([1, 2, 3, 4, 5]);
});

test("batch", async () => {
	async function* oneToTenThousand() {
		for (let i = 0; i < 10_000; i++) {
			yield i + 1;
		}
	}

	const result = batch(oneToTenThousand(), 1000);

	let count = 0;
	for await (const b of result) {
		count++;
	}

	expect(count).toBe(10);
});

test("only", () => {
	expect(only(5)).toBe(5);
	expect(only([5])).toBe(5);
	expect(only([5, 10])).toBe(5);
	expect(only([])).toBe(undefined);
});

test("command", () => {
	const input = { id: "", command: () => () => {} };

	expect(command(input)).toBe(input);
});
