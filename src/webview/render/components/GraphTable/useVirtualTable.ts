import { RefObject } from "preact";
import { useEffect, useState } from "preact/hooks";

export const useVirtualTable = <T>({
	ref,
	rowHeight,
	data,
}: {
	ref: RefObject<HTMLElement>;
	rowHeight: number;
	data: T[];
}) => {
	const [firstIndex, setFirstIndex] = useState(0);
	const [sliceLength, setSliceLength] = useState(0);

	useEffect(() => {
		const h = () => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			const top = Math.min(rect.top, 0);
			const height = window.innerHeight - Math.max(rect.top, 0);

			setFirstIndex(Math.floor(-top / rowHeight));
			setSliceLength(Math.ceil(height / rowHeight));
		};
		window.addEventListener("scroll", h);
		window.addEventListener("resize", h);
		h();

		return () => {
			window.removeEventListener("scroll", h);
			window.removeEventListener("resize", h);
		};
	}, []);

	return {
		topPadding: firstIndex * rowHeight,
		slice: data.slice(firstIndex, firstIndex + sliceLength + 1),
		bottomPadding: (data.length - (firstIndex + sliceLength)) * rowHeight,
	};
};
