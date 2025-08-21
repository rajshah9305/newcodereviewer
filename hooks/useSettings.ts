// hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { AI_PROVIDERS, AIConfig } from '../services/aiService';

const STORAGE_KEY_PROMPT = 'ai_code_review_prompt';
const STORAGE_KEY_AI_CONFIG = 'ai_code_review_config';
const STORAGE_KEY_API_KEYS = 'ai_code_review_api_keys';

const DEFAULT_PROMPT = `As an expert code reviewer, analyze the provided code snippet. Provide a detailed, constructive critique focusing on quality, correctness, performance, security, and adherence to best practices. Identify potential bugs, suggest concrete improvements with code examples, and comment on its overall structure and readability.`;

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  apiKey: ''
};

interface APIKeys {
  [providerId: string]: string;
}

export const useSettings = () => {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [apiKeys, setApiKeys] = useState<APIKeys>({});

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      // Load prompt
      const storedPrompt = localStorage.getItem(STORAGE_KEY_PROMPT);
      if (storedPrompt && storedPrompt.trim() !== '') {
        setPrompt(storedPrompt);
      }

      // Load AI config
      const storedConfig = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        setAiConfig({ ...DEFAULT_AI_CONFIG, ...parsedConfig });
      }

      // Load API keys
      const storedKeys = localStorage.getItem(STORAGE_KEY_API_KEYS);
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        setApiKeys(parsedKeys);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
  }, []);

  // Update aiConfig with current API key whenever provider changes
  useEffect(() => {
    setAiConfig(prev => ({
      ...prev,
      apiKey: apiKeys[prev.provider] || ''
    }));
  }, [apiKeys, aiConfig.provider]);

  const savePrompt = useCallback((newPrompt: string) => {
    const promptToSave = newPrompt.trim() === '' ? DEFAULT_PROMPT : newPrompt;
    try {
      localStorage.setItem(STORAGE_KEY_PROMPT, promptToSave);
      setPrompt(promptToSave);
    } catch (error) {
      console.error("Failed to save prompt to localStorage:", error);
    }
  }, []);

  const resetPrompt = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROMPT, DEFAULT_PROMPT);
      setPrompt(DEFAULT_PROMPT);
    } catch (error) {
      console.error("Failed to reset prompt:", error);
    }
  }, []);

  const updateAIConfig = useCallback((updates: Partial<AIConfig>) => {
    const newConfig = { ...aiConfig, ...updates };
    
    // If provider changed, update the model to the first available model for that provider
    if (updates.provider && updates.provider !== aiConfig.provider) {
      const provider = AI_PROVIDERS.find(p => p.id === updates.provider);
      if (provider && provider.models.length > 0) {
        newConfig.model = provider.models[0];
      }
    }

    // Set API key from stored keys
    newConfig.apiKey = apiKeys[newConfig.provider] || '';

    try {
      localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(newConfig));
      setAiConfig(newConfig);
    } catch (error) {
      console.error("Failed to save AI config:", error);
    }
  }, [aiConfig, apiKeys]);

  const saveAPIKey = useCallback((providerId: string, apiKey: string) => {
    const newKeys = { ...apiKeys, [providerId]: apiKey };
    try {
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(newKeys));
      setApiKeys(newKeys);
      
      // If this is the current provider, update the config immediately
      if (providerId === aiConfig.provider) {
        setAiConfig(prev => ({ ...prev, apiKey }));
      }
    } catch (error) {
      console.error("Failed to save API key:", error);
    }
  }, [apiKeys, aiConfig.provider]);

  const removeAPIKey = useCallback((providerId: string) => {
    const newKeys = { ...apiKeys };
    delete newKeys[providerId];
    try {
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(newKeys));
      setApiKeys(newKeys);
      
      // If this is the current provider, clear the API key in config
      if (providerId === aiConfig.provider) {
        setAiConfig(prev => ({ ...prev, apiKey: '' }));
      }
    } catch (error) {
      console.error("Failed to remove API key:", error);
    }
  }, [apiKeys, aiConfig.provider]);

  const getCurrentAIConfig = useCallback((): AIConfig => {
    return {
      ...aiConfig,
      apiKey: apiKeys[aiConfig.provider] || ''
    };
  }, [aiConfig, apiKeys]);

  const getAvailableModels = useCallback(() => {
    const provider = AI_PROVIDERS.find(p => p.id === aiConfig.provider);
    return provider?.models || [];
  }, [aiConfig.provider]);

  const isConfigured = useCallback(() => {
    const currentApiKey = apiKeys[aiConfig.provider];
    return !!(aiConfig.provider && aiConfig.model && currentApiKey);
  }, [aiConfig, apiKeys]);

  return {
    // Prompt settings
    prompt,
    savePrompt,
    resetPrompt,
    DEFAULT_PROMPT,
    
    // AI configuration
    aiConfig,
    updateAIConfig,
    getCurrentAIConfig,
    getAvailableModels,
    
    // API key management
    apiKeys,
    saveAPIKey,
    removeAPIKey,
    
    // Utility
    isConfigured,
    providers: AI_PROVIDERS
  };
};
