export class TypedEventTarget<
	TEvents extends Record<string, unknown>,
> extends EventTarget {
	addEventListener<T extends keyof TEvents & string>(
		type: T,
		callback: ((e: TypedEvent<T, TEvents[T]>) => void) | null,
		options?: AddEventListenerOptions | boolean,
	): (e: TypedEvent<T, TEvents[T]>) => void;
	addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: AddEventListenerOptions | boolean,
	): void;
	addEventListener(
		type: string,
		callback: any | null,
		options?: AddEventListenerOptions | boolean,
	) {
		super.addEventListener(type, callback as any, options);
		return callback;
	}

	dispatch<T extends keyof TEvents & string>(
		type: T,
		detail: TEvents[T],
	): boolean {
		const event = new TypedEvent(type, detail);
		return super.dispatchEvent(event);
	}

	removeEventListener<T extends keyof TEvents & string>(
		type: T,
		callback: ((e: TypedEvent<T, TEvents[T]>) => void) | null,
		options?: EventListenerOptions | boolean,
	): void;
	removeEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean,
	): void;
	removeEventListener(
		type: string,
		callback: any | null,
		options?: EventListenerOptions | boolean,
	): void {
		return super.removeEventListener(type, callback as any, options);
	}
}

export class TypedEvent<
	TType extends string,
	TDetail,
> extends CustomEvent<TDetail> {
	public declare readonly type: TType;
	public declare readonly detail: TDetail;

	constructor(type: TType, detail: TDetail) {
		super(type, { detail });
	}
}
