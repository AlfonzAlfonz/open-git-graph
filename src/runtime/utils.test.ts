import { collect } from "@alfonz/async/collect";
import { batch, pipeThrough, take } from "./utils";

describe("utils", () => {
	test("take", async () => {
		const it = (async function* () {
			yield 1;
			yield 2;
			yield 3;
			yield 4;
		})();

		const numbers = await collect(take(it, 10));
		expect(numbers).toEqual([1, 2, 3, 4]);
	});

	describe("batch", () => {
		async function* generator(n: number) {
			for (let i = 0; i < n; i++) {
				yield i;
			}
		}

		test("empty", async () => {
			const numbers = await collect(batch(generator(0), 10));
			expect(numbers).toEqual([]);
		});

		test("no remainder", async () => {
			const numbers = await collect(batch(generator(100), 10));
			expect(numbers).toHaveLength(10);
		});

		test("remainder", async () => {
			const numbers = await collect(batch(generator(102), 10));
			expect(numbers).toHaveLength(11);
			expect(numbers.at(-1)).toEqual([100, 101]);
		});
	});

	describe("pipeThrough", () => {
		test("basic", async () => {
			async function* base() {
				for (const i of [...Array(20)].keys()) {
					yield i;
				}
			}

			function* transform(): Generator<number[], void, number[] | undefined> {
				let result: number[] = [];
				while (true) {
					const batched = yield result;
					if (batched === undefined) break;

					result = batched.map((n) => n * 2);
					if (result.length === 0) {
						return;
					}
				}
			}

			const result = await collect(pipeThrough(base(), transform(), 5));

			expect(result).toEqual([
				[],
				[10, 12, 14, 16, 18],
				[20, 22, 24, 26, 28],
				[30, 32, 34, 36, 38],
			]);
		});
	});
});
