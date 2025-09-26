import { AlertType, Alert } from "../../models/alert";
import CustomAlert from "./CustomAlert";
import React, { createContext, useState, ReactNode, useContext } from "react";

interface AlertContextType {
    showAlert: (message: string, variant: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<Alert | null> (null);

    const showAlert = (message: string, variant: AlertType) => {
        setAlert({ message, variant });
        setTimeout(() => {
            setAlert(null);
        }, 3000);
    };

    return (
        <AlertContext.Provider value = {{ showAlert }}>
            {children}
            {alert && <CustomAlert {...alert} />}
        </AlertContext.Provider>
    )
}

export const useAlert = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) {
        throw new Error("useAlert must be used within an AlertProvider");
    }
    return ctx;
}