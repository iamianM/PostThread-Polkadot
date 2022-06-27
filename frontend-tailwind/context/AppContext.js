// src/context/state.js
import { createContext, useContext } from 'react';

const AppContext = createContext();

export function AppWrapper({ children, isLoggedIn, username, id }) {

    let sharedState = { isLoggedIn, username, id }
    return (
        <AppContext.Provider value={sharedState}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}