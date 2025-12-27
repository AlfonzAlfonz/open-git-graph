import { createContext } from "react";
import { GitRefFullname } from "../../../../../universal/git";
import { TypedEventTarget } from "../../../../state/TypedEventTarget";
import { BadgeItem } from "./types";

export interface IPrimaryLaunchpadContext {
	input: string;
	selected: BadgeItem[];

	clearSelected: (() => void) | undefined;
}

export const PrimaryLaunchpadContext = createContext<IPrimaryLaunchpadContext>(
	null!,
);

/**
 * Event target used for high performance communication, primarily between the
 * main state hook and popup option components. Passing the state down is very
 * slow, because it triggers rerender of every option at every change.
 * Dispatching an event to all subscribers is very fast, because only affected
 * components are rerendered.
 */
export type LaunchpadEventTarget = TypedEventTarget<{
	highlight: string | undefined;
	selected: GitRefFullname[];

	highlightItem: string;
	toggleSelect: GitRefFullname;
}>;

export const TargetLaunchpadContext = createContext<LaunchpadEventTarget>(
	null!,
);
