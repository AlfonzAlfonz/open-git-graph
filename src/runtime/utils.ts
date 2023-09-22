export const buffer = async <T>(iterable: AsyncIterable<T>) => {
	const result = [];
	for await (const itm of iterable) {
		result.push(itm);
	}
	return result;
};

export async function* batch<T>(
	iterable: AsyncIterable<T>,
	batchSize: number = 200,
) {
	let batchArray = [];
	for await (const itm of iterable) {
		batchArray.push(itm);
		if (batchArray.length >= batchSize) {
			yield batchArray;
			batchArray = [];
		}
	}
	return batchArray;
}
