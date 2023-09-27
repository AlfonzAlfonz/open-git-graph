import { FromRuntimeMessage } from "../../../types/messages";

export const msg = <T extends FromRuntimeMessage>(msg: T) => msg;
