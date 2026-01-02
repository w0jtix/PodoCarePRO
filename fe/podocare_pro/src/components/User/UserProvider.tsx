import { createContext, useContext, useState, useEffect, useCallback } from "react";
import AuthService from "../../services/AuthService";
import { JwtUser } from "../../models/login";

type UserContextType = {
    user: JwtUser | undefined;
    setUser: (user: JwtUser | undefined) => void;
    refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<JwtUser | undefined>(AuthService.getCurrentUser());

    const refreshUser = useCallback(() => {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
    },[])

    useEffect(() => {
        setUser(AuthService.getCurrentUser());
    }, [])

    useEffect(() => {
        const handleStorageChange = (e:StorageEvent) => {
            if (e.key === "user") {
                refreshUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    }, [refreshUser])

    return(
        <UserContext.Provider value={{ user, setUser, refreshUser }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserProvider");
    return ctx;
}