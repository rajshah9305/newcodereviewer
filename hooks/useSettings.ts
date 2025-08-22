// hooks/useSettings.ts - Enhanced Provider-Model Management with Real-time Updates
import { useState, useEffect, useCallback } from 'react';
import { aiService, AI_PROVIDERS, AIConfig } from '../services/aiService';

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

  // ENHANCED: Provider switching with automatic model selection and validation
  const updateAIConfig = useCallback((updates: Partial<AIConfig>) => {
    setAiConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // If provider changed, automatically set the first available model for that provider
      if (updates.provider && updates.provider !== prev.provider) {
        const provider = AI_PROVIDERS.find(p => p.id === updates.provider);
        if (provider && provider.models.length > 0) {
          newConfig.model = provider.models[0]; // Auto-select first model
          console.log(`Provider changed to ${provider.name}, auto-selected model: ${provider.models[0]}`);
        } else {
          console.warn(`Provider ${updates.provider} has no available models`);
        }
      }

      // Validate that the current model exists for the current provider
      const currentProvider = AI_PROVIDERS.find(p => p.id === newConfig.provider);
      if (currentProvider) {
        if (!currentProvider.models.includes(newConfig.model)) {
          newConfig.model = currentProvider.models[0]; // Fallback to first model
          console.log(`Model ${newConfig.model} not available for ${currentProvider.name}, switched to: ${currentProvider.models[0]}`);
        }
      } else {
        console.warn(`Unknown provider: ${newConfig.provider}`);
      }

      // Set API key from stored keys
      newConfig.apiKey = apiKeys[newConfig.provider] || '';

      try {
        localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(newConfig));
      } catch (error) {
        console.error("Failed to save AI config:", error);
      }

      return newConfig;
    });
  }, [apiKeys]);

  // ENHANCED: Get available models for current provider only with validation
  const getAvailableModels = useCallback(() => {
    const provider = AI_PROVIDERS.find(p => p.id === aiConfig.provider);
    if (!provider) {
      console.warn(`Provider ${aiConfig.provider} not found`);
      return [];
    }
    const models = provider.models || [];
    console.log(`Available models for ${provider.name}:`, models);
    return models;
  }, [aiConfig.provider]);

  // ENHANCED: Get models for ANY provider (useful for settings display)
  const getModelsForProvider = useCallback((providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    return provider?.models || [];
  }, []);

  // Get provider info
  const getCurrentProvider = useCallback(() => {
    return AI_PROVIDERS.find(p => p.id === aiConfig.provider);
  }, [aiConfig.provider]);

  // ENHANCED: Get provider by ID
  const getProviderById = useCallback((providerId: string) => {
    return AI_PROVIDERS.find(p => p.id === providerId);
  }, []);

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

      if (provider.models.length === 0) {
        return { valid: false, error: 'Provider has no available models' };
      }

      const testConfig: AIConfig = {
        provider: providerId,
        model: provider.models[0],
        apiKey: apiKey.trim()
      };

      const result = await aiService.testAPIKey(testConfig);
      
      setApiKeyStatus(prev => {
        const newStatus = {
          ...prev,
          [providerId]: {
            valid: result.valid,
            tested: true,
            error: result.error,
            lastTested: Date.now()
          }
        };
        
        try {
          localStorage.setItem(STORAGE_KEY_API_KEY_STATUS, JSON.stringify(newStatus));
        } catch (error) {
          console.error("Failed to save API key status:", error);
        }
        
        return newStatus;
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      
      setApiKeyStatus(prev => {
        const newStatus = {
          ...prev,
          [providerId]: {
            valid: false,
            tested: true,
            error: errorMessage,
            lastTested: Date.now()
          }
        };
        
        try {
          localStorage.setItem(STORAGE_KEY_API_KEY_STATUS, JSON.stringify(newStatus));
        } catch (error) {
          console.error("Failed to save API key status:", error);
        }
        
        return newStatus;
      });
      
      return { valid: false, error: errorMessage };
    } finally {
      setIsValidatingKey(prev => ({ ...prev, [providerId]: false }));
    }
  }, []);

  const saveAPIKey = useCallback(async (providerId: string, apiKey: string): Promise<{success: boolean; error?: string}> => {
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      return { success: false, error: 'API key cannot be empty' };
    }

    const validation = await validateAPIKey(providerId, trimmedKey);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      setApiKeys(prev => {
        const newKeys = { ...prev, [providerId]: trimmedKey };
        localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(newKeys));
        return newKeys;
      });
      
      // Auto-switch to the newly configured provider
      const provider = AI_PROVIDERS.find(p => p.id === providerId);
      if (provider && provider.models.length > 0) {
        console.log('Auto-switching to newly configured provider:', provider.name);
        updateAIConfig({ 
          provider: providerId,
          model: provider.models[0] // Auto-select first available model
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Failed to save API key:", error);
      return { success: false, error: 'Failed to save API key' };
    }
  }, [validateAPIKey, updateAIConfig]);

  const removeAPIKey = useCallback((providerId: string) => {
    setApiKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[providerId];
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(newKeys));
      return newKeys;
    });
    
    setApiKeyStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[providerId];
      localStorage.setItem(STORAGE_KEY_API_KEY_STATUS, JSON.stringify(newStatus));
      return newStatus;
    });
    
    // If removing the current provider's key, switch to another configured provider
    if (providerId === aiConfig.provider) {
      const alternativeProvider = AI_PROVIDERS.find(p => {
        const hasKey = apiKeys[p.id] && p.id !== providerId;
        const keyStatus = apiKeyStatus[p.id];
        return hasKey && keyStatus?.valid && p.models.length > 0;
      });
      
      if (alternativeProvider) {
        console.log('Switching to alternative provider:', alternativeProvider.name);
        updateAIConfig({ 
          provider: alternativeProvider.id,
          model: alternativeProvider.models[0]
        });
      }
    }
  }, [aiConfig, apiKeys, apiKeyStatus, updateAIConfig]);

  const getCurrentAIConfig = useCallback((): AIConfig => {
    return {
      ...aiConfig,
      apiKey: apiKeys[aiConfig.provider] || ''
    };
  }, [aiConfig, apiKeys]);

  const isConfigured = useCallback(() => {
    const currentApiKey = apiKeys[aiConfig.provider];
    const keyStatus = apiKeyStatus[aiConfig.provider];
    const provider = AI_PROVIDERS.find(p => p.id === aiConfig.provider);
    return !!(aiConfig.provider && aiConfig.model && currentApiKey && keyStatus?.valid && provider?.models.includes(aiConfig.model));
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
    getCurrentProvider,
    getProviderById,
    getAvailableModels, // Returns only models for the current provider
    getModelsForProvider, // Returns models for any specific provider
    
    // API key management
    apiKeys,
    saveAPIKey,
    removeAPIKey,
    validateAPIKey,
    isValidatingKey,
    getAPIKeyStatus,
    
    // Utility
    isConfigured,
    providers: AI_PROVIDERS
  };
};
