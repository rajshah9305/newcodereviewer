// hooks/useSettings.ts - Complete Enhanced Version
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
  const [isInitialized, setIsInitialized] = useState(false);

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

      // Load API key status
      const storedStatus = localStorage.getItem(STORAGE_KEY_API_KEY_STATUS);
      if (storedStatus) {
        const parsedStatus = JSON.parse(storedStatus);
        setApiKeyStatus(parsedStatus);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      setIsInitialized(true);
    }
  }, []);

  // Auto-switch to first configured provider on startup
  useEffect(() => {
    if (!isInitialized) return;
    
    const configuredProvider = findFirstConfiguredProvider();
    if (configuredProvider && aiConfig.provider !== configuredProvider.id) {
      console.log('Auto-switching to configured provider:', configuredProvider.name);
      updateAIConfig({ 
        provider: configuredProvider.id,
        model: configuredProvider.models[0]
      });
    }
  }, [isInitialized, apiKeys, apiKeyStatus]);

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
    setAiConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // If provider changed, update the model to the first available model for that provider
      if (updates.provider && updates.provider !== prev.provider) {
        const provider = AI_PROVIDERS.find(p => p.id === updates.provider);
        if (provider && provider.models.length > 0) {
          newConfig.model = provider.models[0];
        }
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
      
      // Update status immediately
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
      
      // Update status with error
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

    // Validate the API key first
    const validation = await validateAPIKey(providerId, trimmedKey);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Save the API key if validation passed
    try {
      // Update API keys state
      setApiKeys(prev => {
        const newKeys = { ...prev, [providerId]: trimmedKey };
        localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(newKeys));
        return newKeys;
      });
      
      // IMMEDIATE AUTO-SWITCH: Switch to the newly configured provider
      const provider = AI_PROVIDERS.find(p => p.id === providerId);
      if (provider) {
        console.log('Auto-switching to provider:', provider.name);
        
        // Update AI config immediately
        setAiConfig(prev => {
          const updatedConfig: AIConfig = {
            provider: providerId,
            model: provider.models[0], // Auto-select first available model
            apiKey: trimmedKey
          };
          
          localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(updatedConfig));
          return updatedConfig;
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Failed to save API key:", error);
      return { success: false, error: 'Failed to save API key' };
    }
  }, [validateAPIKey]);

  const removeAPIKey = useCallback((providerId: string) => {
    // Update API keys
    setApiKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[providerId];
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(newKeys));
      return newKeys;
    });
    
    // Update API key status
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
        return hasKey && keyStatus?.valid;
      });
      
      if (alternativeProvider) {
        console.log('Switching to alternative provider:', alternativeProvider.name);
        setAiConfig(prev => {
          const updatedConfig = { 
            ...prev, 
            provider: alternativeProvider.id,
            model: alternativeProvider.models[0],
            apiKey: apiKeys[alternativeProvider.id] || ''
          };
          localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(updatedConfig));
          return updatedConfig;
        });
      } else {
        // No alternative provider, just clear the API key
        setAiConfig(prev => {
          const updatedConfig = { ...prev, apiKey: '' };
          localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(updatedConfig));
          return updatedConfig;
        });
      }
    }
  }, [aiConfig, apiKeys, apiKeyStatus]);

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
