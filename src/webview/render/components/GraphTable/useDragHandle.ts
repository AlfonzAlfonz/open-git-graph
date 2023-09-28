import { RefObject } from "preact";
import { useCallback, useLayoutEffect, useRef } from "preact/hooks";

export const useDragHandle = (
	ref: RefObject<HTMLElement>,
	drag: "pre" | "post" | "none",
	minWidth?: number,
) => {
	const onDragStart = useCallback((e: DragEvent) => {
		e.dataTransfer?.setDragImage(emptyGhost, 0, 0);
	}, []);
	const onDrag = useDebounce((e: DragEvent) => {
		e.preventDefault();
		if (e.pageX === 0) return;

		const el = ref.current!;
		if (drag === "post") {
			el.style.width = `${Math.max(e.pageX - el.offsetLeft, minWidth ?? 0)}px`;
		} else {
			el.style.width = `${Math.max(
				el.offsetLeft + el.offsetWidth - e.pageX,
				minWidth ?? 0,
			)}px`;
		}
	});
	const onDragEnd = useCallback((e: DragEvent) => {
		e.preventDefault();
	}, []);

	return { onDragStart, onDrag, onDragEnd };
};

const emptyGhost = new Image();
emptyGhost.src =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

const useDebounce = <TArgs extends any[]>(
	fn: (...args: TArgs) => unknown,
	timeout: number = 1000 / 30,
) => {
	const ref = useRef({ fn, available: true });

	useLayoutEffect(() => {
		ref.current.fn = fn;
		ref.current.available = true;
	}, [fn]);

	return useCallback((...args: TArgs) => {
		if (ref.current.available) {
			ref.current.available = false;
			setTimeout(() => (ref.current.available = true), timeout);
			ref.current.fn(...args);
		}
	}, []);
};
