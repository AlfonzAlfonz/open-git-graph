const WARMUP = 10;
const COUNT = 200;

export const benchmark = async <T>(
	name: string,
	opts: {
		maxAvgTime?: number;
		prepare: () => Promise<T>;
		run: (value: T) => Promise<void>;
	},
) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	console.info(name);

	for (let i = 0; i < WARMUP; i++) {
		await run(opts.prepare, opts.run);
	}

	const times = [];
	for (let i = 0; i < COUNT; i++) {
		// console.info(`Run #${i + 1}`);
		const result = await run(opts.prepare, opts.run);
		times.push(result);
		// console.info(` - time: ${result.toFixed(3)}ms`);

		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	const sum = times.reduce((acc, x) => acc + x, 0);
	const avg = sum / times.length;

	console.info("Average run");
	console.info(` - time: ${(sum / times.length).toFixed(3)}ms`);

	if (opts.maxAvgTime && avg > opts.maxAvgTime) {
		console.error("Benchmark took longer than expected");
		process.exit(1);
	}
};

const run = async <T>(
	prepare: () => Promise<T>,
	fn: (value: T) => Promise<void>,
) => {
	const prep = await prepare();
	const start = performance.now();

	await fn(prep);

	const end = performance.now();
	return end - start;
};
