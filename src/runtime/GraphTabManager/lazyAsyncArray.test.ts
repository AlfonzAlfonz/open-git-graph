import { collect } from "@alfonz/async/collect";
import { lazyAsyncArray } from "./lazyAsyncArray";

test("lazyAsyncArray", async () => {
	async function* numbers() {
		for (let i = 0; i <= 10; i++) {
			yield i;
		}
	}

	const array = lazyAsyncArray(numbers());

	expect(await array.at(5)).toBe(5);
	expect(await collect(array)).toEqual(await collect(numbers()));
	expect(await collect(array)).toEqual(await collect(numbers()));
});
