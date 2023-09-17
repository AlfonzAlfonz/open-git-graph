export const groupBy = <T, TKey, TValue = T>(
	iterable: Iterable<T>,
	keySelector: (x: T) => TKey,
	valueSelector: (x: T) => TValue = (x) => x as any as TValue,
) => {
	const map = new Map<TKey, TValue[]>();
	for (const x of iterable) {
		const key = keySelector(x);
		if (!map.has(key)) {
			map.set(key, [valueSelector(x)]);
		} else {
			map.get(key)!.push(valueSelector(x));
		}
	}
	return map;
};
