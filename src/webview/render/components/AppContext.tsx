import { createContext, useContext } from "react";
import { App } from "../useApp";

export const AppContext = createContext<App["state"]>(null!);

export const useAppContext = () => useContext(AppContext);
