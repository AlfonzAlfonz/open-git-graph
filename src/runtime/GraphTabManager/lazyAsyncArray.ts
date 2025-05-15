export const lazyAsyncArray = <T>(iterator: AsyncIterator<T, void, void>) => {
	const array: T[] = [];

	const readNextValue = async () => {
		const iteratorResult = await iterator.next();
		if (iteratorResult.done) {
			return iteratorResult;
		}

		array.push(iteratorResult.value);
		return iteratorResult;
	};

	return {
		at: async (index: number) => {
			if (index < 0) {
				throw new Error("Not implemented");
			}

			if (index < array.length) {
				return array[index]!;
			}

			let result: IteratorResult<T>;
			for (let i = array.length; i <= index; i++) {
				result = await readNextValue();
				if (result.done) {
					break;
				}
			}

			return result!.value;
		},
		[Symbol.asyncIterator]: () => {
			const arrayIterator = array[Symbol.iterator]();

			return {
				next: async () => {
					const arrayResult = arrayIterator.next();
					if (!arrayResult.done) {
						return arrayResult;
					}

					return await readNextValue();
				},
			};
		},
	};
};
