import { ComponentChild, FunctionComponent } from "preact";

export type PreactComponent<
	P extends {},
	Children = ComponentChild,
> = FunctionComponent<
	Omit<P, "children"> &
		(Children extends undefined ? {} : { children: Children })
>;
