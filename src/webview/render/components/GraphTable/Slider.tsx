import { MutableRefObject, useEffect, useRef } from "react";

interface Props {
	parent: MutableRefObject<HTMLElement>;
}

export const Slider = ({ parent }: Props) => {
	const sliderRef = useRef<HTMLDivElement>(null!);

	useEffect(() => {
		const update = () => {
			const rect = parent.current.getBoundingClientRect();

			const height = rect.height;

			const scroll = parent.current.scrollTop;
			const scrollHeight = parent.current.scrollHeight;

			const top = (scroll / scrollHeight) * height;
			const h = height * (height / scrollHeight);

			sliderRef.current.style.top = `${top}px`;
			sliderRef.current.style.height = `${h}px`;
		};

		const observer = new ResizeObserver(update);
		observer.observe(parent.current);

		parent.current.addEventListener("scroll", update);

		update();

		return () => {
			// observer.disconnect();
			parent.current.removeEventListener("scroll", update);
		};
	}, []);

	return <div className="slider absolute right-0 top-0" ref={sliderRef} />;
};
