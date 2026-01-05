import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface ProContextType {
    isPro: boolean;
    unlockPro: () => void;
    isLoading: boolean;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

export const ProProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const storedPro = localStorage.getItem(`isPro_${user.uid}`);
            setIsPro(storedPro === 'true');
        } else {
            setIsPro(false);
        }
        setIsLoading(false);
    }, [user]);

    const unlockPro = () => {
        if (user) {
            setIsPro(true);
            localStorage.setItem(`isPro_${user.uid}`, 'true');
        }
    };

    return (
        <ProContext.Provider value={{ isPro, unlockPro, isLoading }}>
            {children}
        </ProContext.Provider>
    );
};

export const usePro = () => {
    const context = useContext(ProContext);
    if (context === undefined) {
        throw new Error('usePro must be used within a ProProvider');
    }
    return context;
};
