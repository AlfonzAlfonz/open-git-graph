import { Popover } from "@base-ui/react/popover";
import { useRef } from "react";
import { GitRefFullname } from "../../../../../universal/git";
import { useAppContext } from "../../../contexts/AppContext";
import { useBridgeMutation } from "../../../useBridge/useBridgeMutation";
import { TargetLaunchpadContext, PrimaryLaunchpadContext } from "./context";
import { LaunchpadInput } from "./LaunchpadInput";
import { LaunchpadPopup } from "./LaunchpadPopup";
import { useLaunchpadState } from "./useLaunchpadState";

export type LaunchpadInput = {
	focus: () => void;
};

export default function Launchpad() {
	const { refs, activeRefs: activeRefFullNames, ...app } = useAppContext();

	const [setRefs] = useBridgeMutation((r: GitRefFullname[]) =>
		app.actions.setRefs(r),
	);

	const containerRef = useRef<HTMLDivElement | null>(null);

	const state = useLaunchpadState({
		refs,
		activeRefFullNames,
		setActiveRefFullNames: setRefs,
		launchpadInputRef: app.launchpadInputRef,
	});

	return (
		<PrimaryLaunchpadContext.Provider value={state.context}>
			<TargetLaunchpadContext.Provider value={state.target.current}>
				<Popover.Root {...state.popoverRootProps}>
					<div className="launchpad-wrapper">
						<LaunchpadInput
							containerRef={containerRef}
							containerProps={state.containerProps}
							inputProps={state.inputProps}
						/>
					</div>

					<Popover.Portal>
						<Popover.Positioner
							className="outline-none"
							anchor={containerRef}
							sideOffset={1}
						>
							<LaunchpadPopup
								activeItems={state.activeItems}
								groupsUnfiltered={state.groupedUnfiltered}
							/>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
			</TargetLaunchpadContext.Provider>
		</PrimaryLaunchpadContext.Provider>
	);
}
