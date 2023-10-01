import { LogErrorMessage } from "../../../universal/messages.js";
import { handleError } from "../../handleError.js";
import { Handler } from "../types.js";

export const handleLogError: Handler<LogErrorMessage> = async ({
	msg,
	state,
}) => {
	handleError(state)(msg.content);
};
