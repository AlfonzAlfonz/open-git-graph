import { MutableRefObject, useEffect, useRef } from "react";

interface Props {
	parent: MutableRefObject<HTMLElement>;
}

export const Slider = ({ parent }: Props) => {
	const sliderRef = useRef<HTMLDivElement>(null!);

	useEffect(() => {
		const ref = parent.current;

		const update = () => {
			const rect = ref.getBoundingClientRect();

			const height = rect.height;

			const scroll = ref.scrollTop;
			const scrollHeight = ref.scrollHeight;

			const top = (scroll / scrollHeight) * height;
			const h = height * (height / scrollHeight);

			sliderRef.current.style.top = `${top}px`;
			sliderRef.current.style.height = `${h}px`;
		};

		const observer = new ResizeObserver(update);
		observer.observe(ref);

		ref.addEventListener("scroll", update);

		update();

		return () => {
			// observer.disconnect();
			ref.removeEventListener("scroll", update);
		};
	}, [parent]);

	return <div className="slider absolute right-0 top-0" ref={sliderRef} />;
};
