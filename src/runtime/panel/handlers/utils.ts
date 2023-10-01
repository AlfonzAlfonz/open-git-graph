import { FromRuntimeMessage } from "../../../universal/messages";

export const msg = <T extends FromRuntimeMessage>(msg: T) => msg;
