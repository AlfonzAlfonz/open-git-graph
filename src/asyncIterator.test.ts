/// <reference path="./universal/lib/lib.esnext.asynciterator.d.ts" />

test("AsyncIterator", async () => {
	const iterator = AsyncIterator.from(
		(async function* () {
			yield 1;
			yield 2;
			yield 3;
		})(),
	);

	const result = await iterator.map((x) => x * 2).toArray();

	expect(result).toEqual([2, 4, 6]);
});
