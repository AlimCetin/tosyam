import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast, ToastType } from '../components/Toast';

interface ToastContextData {
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const hideToast = useCallback(() => {
        setVisible(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const showToast = useCallback((msg: string, toastType: ToastType = 'info') => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setMessage(msg);
        setType(toastType);
        setVisible(true);

        timerRef.current = setTimeout(() => {
            setVisible(false);
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <Toast
                visible={visible}
                message={message}
                type={type}
                onHide={hideToast}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
