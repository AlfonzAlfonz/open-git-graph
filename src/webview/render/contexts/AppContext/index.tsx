import { createContext, ReactNode, useContext } from "react";
import { AppValue, useApp } from "./useApp";

const Context = createContext<AppValue>(null!);

export const AppContext = ({ children }: { children: ReactNode }) => {
	const app = useApp();

	return <Context.Provider value={app}>{children}</Context.Provider>;
};

export const useAppContext = () => useContext(Context);
