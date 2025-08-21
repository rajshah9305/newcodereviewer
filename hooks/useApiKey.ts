import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gemini_api_key';

export const useApiKey = () => {
    const [apiKey, setApiKey] = useState<string>('');

    useEffect(() => {
        try {
            const storedApiKey = localStorage.getItem(STORAGE_KEY);
            if (storedApiKey) {
                setApiKey(storedApiKey);
            }
        } catch (error) {
            console.error("Failed to access localStorage for API key:", error);
        }
    }, []);

    const saveApiKey = useCallback((newApiKey: string) => {
        try {
            localStorage.setItem(STORAGE_KEY, newApiKey);
            setApiKey(newApiKey);
        } catch (error) {
            console.error("Failed to save API key to localStorage:", error);
        }
    }, []);

    return { apiKey, saveApiKey };
};