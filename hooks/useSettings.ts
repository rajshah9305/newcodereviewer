import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gemini_code_review_prompt';

const DEFAULT_PROMPT = `As an expert code reviewer, analyze the provided code snippet. Provide a detailed, constructive critique focusing on quality, correctness, performance, security, and adherence to best practices. Identify potential bugs, suggest concrete improvements with code examples, and comment on its overall structure and readability. Format your response using markdown with clear headings for each section (e.g., ### Potential Bugs, ### Suggestions for Improvement).`;

export const useSettings = () => {
    const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);

    useEffect(() => {
        try {
            const storedPrompt = localStorage.getItem(STORAGE_KEY);
            if (storedPrompt && storedPrompt.trim() !== '') {
                setPrompt(storedPrompt);
            } else {
                setPrompt(DEFAULT_PROMPT);
            }
        } catch (error) {
            console.error("Failed to access localStorage:", error);
            setPrompt(DEFAULT_PROMPT);
        }
    }, []);

    const savePrompt = useCallback((newPrompt: string) => {
        const promptToSave = newPrompt.trim() === '' ? DEFAULT_PROMPT : newPrompt;
        try {
            localStorage.setItem(STORAGE_KEY, promptToSave);
            setPrompt(promptToSave);
        } catch (error) {
            console.error("Failed to save prompt to localStorage:", error);
        }
    }, []);

    const resetPrompt = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY, DEFAULT_PROMPT);
            setPrompt(DEFAULT_PROMPT);
        } catch (error) {
            console.error("Failed to save prompt to localStorage:", error);
        }
    }, []);

    return { prompt, savePrompt, resetPrompt, DEFAULT_PROMPT };
};
