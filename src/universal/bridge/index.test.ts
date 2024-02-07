import { createTestClientServerBridge } from "./_utils.test";

class TestBridge {
	async resolvesTo5(): Promise<5> {
		return 5;
	}

	async rejects() {
		throw new Error("Rejected");
	}
}

test("should setup client server bridge", () => {
	const [bridge] = createTestClientServerBridge(new TestBridge());

	expect(bridge.resolvesTo5()).resolves.toBe(5);
	expect(bridge.rejects()).rejects.toBeInstanceOf(Error);
});
