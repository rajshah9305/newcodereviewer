// hooks/useSettings.ts - Enhanced version
import { useState, useEffect, useCallback } from 'react';
import { AI_PROVIDERS, AIConfig, aiService } from '../services/aiService';

const STORAGE_KEY_PROMPT = 'ai_code_review_prompt';
const STORAGE_KEY_AI_CONFIG = 'ai_code_review_config';
const STORAGE_KEY_API_KEYS = 'ai_code_review_api_keys';
const STORAGE_KEY_API_KEY_STATUS = 'ai_code_review_api_key_status';

const DEFAULT_PROMPT = `As an expert code reviewer, analyze the provided code snippet. Provide a detailed, constructive critique focusing on quality, correctness, performance, security, and adherence to best practices. Identify potential bugs, suggest concrete improvements with code examples, and comment on its overall structure and readability.`;

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  apiKey: ''
};

interface APIKeys {
  [providerId: string]: string;
}

interface APIKeyStatus {
  [providerId: string]: {
    valid: boolean;
    tested: boolean;
    error?: string;
    lastTested?: number;
  };
}

export const useSettings = () => {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [apiKeys, setApiKeys] = useState<APIKeys>({});
  const [apiKeyStatus, setApiKeyStatus] = useState<APIKeyStatus>({});
  const [isValidatingKey, setIsValidatingKey] = useState<{[providerId: string]: boolean}>({});

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedPrompt = localStorage.getItem(STORAGE_KEY_PROMPT);
      if (storedPrompt && storedPrompt.trim() !== '') {
        setPrompt(storedPrompt);
      }

      const storedConfig = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        setAiConfig({ ...DEFAULT_AI_CONFIG, ...parsedConfig });
      }

      const storedKeys = localStorage.getItem(STORAGE_KEY_API_KEYS);
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        setApiKeys(parsedKeys);
      }

      const storedStatus = localStorage.getItem(STORAGE_KEY_API_KEY_STATUS);
      if (storedStatus) {
        const parsedStatus = JSON.parse(storedStatus);
        setApiKeyStatus(parsedStatus);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
  }, []);

  // Auto-switch to first configured provider on startup
  useEffect(() => {
    const configuredProvider = findFirstConfiguredProvider();
    if (configuredProvider && aiConfig.provider !== configuredProvider.id) {
      updateAIConfig({ 
        provider: configuredProvider.id,
        model: configuredProvider.models[0]
      });
    }
  }, [apiKeys, apiKeyStatus]);

  // Update aiConfig with current API key whenever provider changes
  useEffect(() => {
    setAiConfig(prev => ({
      ...prev,
      apiKey: apiKeys[prev.provider] || ''
    }));
  }, [apiKeys, aiConfig.provider]);

  const findFirstConfiguredProvider = useCallback(() => {
    return AI_PROVIDERS.find(provider => {
      const hasKey = apiKeys[provider.id];
      const keyStatus = apiKeyStatus[provider.id];
      return hasKey && keyStatus?.valid;
    });
  }, [apiKeys, apiKeyStatus]);

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
    
    if (updates.provider && updates.provider !== aiConfig.provider) {
      const provider = AI_PROVIDERS.find(p => p.id === updates.provider);
      if (provider && provider.models.length > 0) {
        newConfig.model = provider.models[0];
      }
    }

    newConfig.apiKey = apiKeys[newConfig.provider] || '';

    try {
      localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(newConfig));
      setAiConfig(newConfig);
    } catch (error) {
      console.error("Failed to save AI config:", error);
    }
  }, [aiConfig, apiKeys]);

  const validateAPIKey = useCallback(async (providerId: string, apiKey: string): Promise<{valid: boolean; error?: string}> => {
    if (!apiKey.trim()) {
      return { valid: false, error: 'API key is required' };
    }

    setIsValidatingKey(prev => ({ ...prev, [providerId]: true }));

    try {
      const provider = AI_PROVIDERS.find(p => p.id === providerId);
      if (!provider) {
        return { valid: false, error: 'Unknown provider' };
      }

      const testConfig: AIConfig = {
        provider: providerId,
        model: provider.models[0],
        apiKey: apiKey.trim()
      };

      const result = await aiService.testAPIKey(testConfig);
      
      const newStatus = {
        ...apiKeyStatus,
        [providerId]: {
          valid: result.valid,
          tested: true,
          error: result.error,
          lastTested: Date.now()
        }
      };
      
      setApiKeyStatus(newStatus);
      localStorage.setItem(STORAGE_KEY_API_KEY_STATUS, JSON.stringify(newStatus));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      const newStatus = {
        ...apiKeyStatus,
        [providerId]: {
          valid: false,
          tested: true,
          error: errorMessage,
          lastTested: Date.now()
        }
      };
      
      setApiKeyStatus(newStatus);
      localStorage.setItem(STORAGE_KEY_API_KEY_STATUS, JSON.stringify(newStatus));
      
      return { valid: false, error: errorMessage };
    } finally {
      setIsValidatingKey(prev => ({ ...prev, [providerId]: false }));
    }
  }, [apiKeyStatus]);

  const saveAPIKey = useCallback(async (providerId: string, apiKey: string): Promise<{success: boolean; error?: string}> => {
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      return { success: false, error: 'API key cannot be empty' };
    }

    const validation = await validateAPIKey(providerId, trimmedKey);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const newKeys = { ...apiKeys, [providerId]: trimmedKey };
    try {
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(newKeys));
      setApiKeys(newKeys);
      
      // AUTO-SWITCH: Immediately switch to the newly configured provider
      const provider = AI_PROVIDERS.find(p => p.id === providerId);
      if (provider) {
        const updatedConfig: AIConfig = {
          provider: providerId,
          model: provider.models[0], // Auto-select first available model
          apiKey: trimmedKey
        };
        
        setAiConfig(updatedConfig);
        localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(updatedConfig));
      }
      
      return { success: true };
    } catch (error) {
      console.error("Failed to save API key:", error);
      return { success: false, error: 'Failed to save API key' };
    }
  }, [apiKeys, validateAPIKey]);

  const removeAPIKey = useCallback((providerId: string) => {
    const newKeys = { ...apiKeys };
    delete newKeys[providerId];
    
    const newStatus = { ...apiKeyStatus };
    delete newStatus[providerId];
    
    try {
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(newKeys));
      localStorage.setItem(STORAGE_KEY_API_KEY_STATUS, JSON.stringify(newStatus));
      setApiKeys(newKeys);
      setApiKeyStatus(newStatus);
      
      // If removing the current provider's key, switch to another configured provider
      if (providerId === aiConfig.provider) {
        const alternativeProvider = findFirstConfiguredProvider();
        if (alternativeProvider) {
          const updatedConfig = { 
            ...aiConfig, 
            provider: alternativeProvider.id,
            model: alternativeProvider.models[0],
            apiKey: newKeys[alternativeProvider.id] || ''
          };
          setAiConfig(updatedConfig);
          localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(updatedConfig));
        } else {
          const updatedConfig = { ...aiConfig, apiKey: '' };
          setAiConfig(updatedConfig);
          localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(updatedConfig));
        }
      }
    } catch (error) {
      console.error("Failed to remove API key:", error);
    }
  }, [apiKeys, apiKeyStatus, aiConfig, findFirstConfiguredProvider]);

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
    const keyStatus = apiKeyStatus[aiConfig.provider];
    return !!(aiConfig.provider && aiConfig.model && currentApiKey && keyStatus?.valid);
  }, [aiConfig, apiKeys, apiKeyStatus]);

  const getAPIKeyStatus = useCallback((providerId: string) => {
    return apiKeyStatus[providerId] || { valid: false, tested: false };
  }, [apiKeyStatus]);

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
    validateAPIKey,
    isValidatingKey,
    getAPIKeyStatus,
    
    // Utility
    isConfigured,
    providers: AI_PROVIDERS,
    findFirstConfiguredProvider
  };
};
