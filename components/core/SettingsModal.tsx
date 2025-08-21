// components/core/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCcw, Eye, EyeOff, Trash2, Key, Bot, Settings2, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { 
        prompt, 
        savePrompt, 
        resetPrompt, 
        aiConfig, 
        updateAIConfig, 
        getAvailableModels,
        apiKeys, 
        saveAPIKey, 
        removeAPIKey,
        validateAPIKey,
        isValidatingKey,
        getAPIKeyStatus,
        isConfigured,
        providers 
    } = useSettings();
    
    const [activeTab, setActiveTab] = useState<'ai' | 'prompt'>('ai');
    const [localPrompt, setLocalPrompt] = useState(prompt);
    const [isPromptSaved, setIsPromptSaved] = useState(false);
    const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({});
    const [newApiKeys, setNewApiKeys] = useState<{[key: string]: string}>({});
    const [saveMessages, setSaveMessages] = useState<{[key: string]: { type: 'success' | 'error', message: string }}>({});

    useEffect(() => {
        if (isOpen) {
            setLocalPrompt(prompt);
            // Initialize newApiKeys with current values
            const initialKeys: {[key: string]: string} = {};
            providers.forEach(provider => {
                initialKeys[provider.id] = apiKeys[provider.id] || '';
            });
            setNewApiKeys(initialKeys);
            setSaveMessages({});
        }
    }, [prompt, isOpen, apiKeys, providers]);

    const handlePromptSave = () => {
        savePrompt(localPrompt);
        setIsPromptSaved(true);
        setTimeout(() => setIsPromptSaved(false), 2000);
    };

    const handlePromptReset = () => {
        resetPrompt();
        setLocalPrompt(prompt);
    };

    const handleProviderChange = (providerId: string) => {
        updateAIConfig({ provider: providerId });
    };

    const handleModelChange = (model: string) => {
        updateAIConfig({ model });
    };

    // ENHANCED FUNCTION WITH AUTO-SWITCH FEEDBACK
    const handleSaveApiKey = async (providerId: string) => {
        const apiKey = newApiKeys[providerId]?.trim();
        if (!apiKey) {
            setSaveMessages(prev => ({
                ...prev,
                [providerId]: { type: 'error', message: 'API key cannot be empty' }
            }));
            return;
        }

        // Clear previous messages
        setSaveMessages(prev => ({ ...prev, [providerId]: undefined }));

        try {
            const result = await saveAPIKey(providerId, apiKey);
            
            if (result.success) {
                const provider = providers.find(p => p.id === providerId);
                setSaveMessages(prev => ({
                    ...prev,
                    [providerId]: { 
                        type: 'success', 
                        message: `✅ API key saved! Switched to ${provider?.name} automatically.` 
                    }
                }));
                
                // Clear the message after 3 seconds
                setTimeout(() => {
                    setSaveMessages(prev => ({ ...prev, [providerId]: undefined }));
                }, 3000);
            } else {
                setSaveMessages(prev => ({
                    ...prev,
                    [providerId]: { type: 'error', message: result.error || 'Failed to save API key' }
                }));
            }
        } catch (error) {
            setSaveMessages(prev => ({
                ...prev,
                [providerId]: { type: 'error', message: 'Failed to validate API key' }
            }));
        }
    };

    const handleTestApiKey = async (providerId: string) => {
        const apiKey = newApiKeys[providerId]?.trim();
        if (!apiKey) {
            setSaveMessages(prev => ({
                ...prev,
                [providerId]: { type: 'error', message: 'Enter an API key to test' }
            }));
            return;
        }

        setSaveMessages(prev => ({ ...prev, [providerId]: undefined }));
        
        try {
            const result = await validateAPIKey(providerId, apiKey);
            
            if (result.valid) {
                setSaveMessages(prev => ({
                    ...prev,
                    [providerId]: { type: 'success', message: 'API key is valid!' }
                }));
            } else {
                setSaveMessages(prev => ({
                    ...prev,
                    [providerId]: { type: 'error', message: result.error || 'API key validation failed' }
                }));
            }
        } catch (error) {
            setSaveMessages(prev => ({
                ...prev,
                [providerId]: { type: 'error', message: 'Failed to test API key' }
            }));
        }
    };

    const handleRemoveApiKey = (providerId: string) => {
        removeAPIKey(providerId);
        setNewApiKeys(prev => ({ ...prev, [providerId]: '' }));
        setSaveMessages(prev => ({ ...prev, [providerId]: undefined }));
    };

    const toggleShowApiKey = (providerId: string) => {
        setShowApiKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
    };

    const getStatusIcon = (providerId: string) => {
        const status = getAPIKeyStatus(providerId);
        const isValidating = isValidatingKey[providerId];
        
        if (isValidating) {
            return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
        }
        
        if (!status.tested) {
            return <AlertCircle className="w-4 h-4 text-slate-400" />;
        }
        
        return status.valid 
            ? <CheckCircle className="w-4 h-4 text-green-500" />
            : <XCircle className="w-4 h-4 text-red-500" />;
    };

    const currentProvider = providers.find(p => p.id === aiConfig.provider);
    const availableModels = getAvailableModels();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] border border-slate-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Configuration Settings</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
                        <X className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'ai'
                                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Bot className="w-4 h-4" />
                        AI Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'prompt'
                                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Settings2 className="w-4 h-4" />
                        System Prompt
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            {/* Current Configuration Status */}
                            <div className={`p-4 rounded-lg border-2 ${
                                isConfigured() 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-amber-50 border-amber-200'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                        isConfigured() ? 'bg-green-500' : 'bg-amber-500'
                                    }`} />
                                    <span className="font-medium text-sm">
                                        {isConfigured() ? 'Configuration Complete' : 'Configuration Required'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    {isConfigured() 
                                        ? `Ready to use ${currentProvider?.name} with ${aiConfig.model}`
                                        : 'Please select an AI provider and configure a valid API key to continue.'
                                    }
                                </p>
                            </div>

                            {/* AI Provider Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    AI Provider
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {providers.map((provider) => {
                                        const status = getAPIKeyStatus(provider.id);
                                        const hasValidKey = apiKeys[provider.id] && status.valid;
                                        
                                        return (
                                            <div key={provider.id}>
                                                <button
                                                    onClick={() => handleProviderChange(provider.id)}
                                                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                                                        aiConfig.provider === provider.id
                                                            ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-500/20'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-medium text-slate-900">{provider.name}</h3>
                                                        <div className="flex items-center gap-1">
                                                            {hasValidKey && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                                                            {getStatusIcon(provider.id)}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        {provider.models.length} models available
                                                    </p>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Model Selection */}
                            {currentProvider && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Model
                                    </label>
                                    <select
                                        value={aiConfig.model}
                                        onChange={(e) => handleModelChange(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        {availableModels.map((model) => (
                                            <option key={model} value={model}>
                                                {model}
                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* API Keys Management */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    API Keys Management
                                </label>
                                <div className="space-y-4">
                                    {providers.map((provider) => {
                                        const status = getAPIKeyStatus(provider.id);
                                        const isValidating = isValidatingKey[provider.id];
                                        const saveMessage = saveMessages[provider.id];
                                        
                                        return (
                                            <div key={provider.id} className="border border-slate-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-slate-900">{provider.name}</h4>
                                                        {getStatusIcon(provider.id)}
                                                    </div>
                                                    {apiKeys[provider.id] && status.valid && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                            Configured & Valid
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <div className="flex-1 relative">
                                                            <input
                                                                type={showApiKeys[provider.id] ? 'text' : 'password'}
                                                                value={newApiKeys[provider.id] || ''}
                                                                onChange={(e) => setNewApiKeys(prev => ({ 
                                                                    ...prev, 
                                                                    [provider.id]: e.target.value 
                                                                }))}
                                                                placeholder={`Enter ${provider.name} API key...`}
                                                                className="w-full p-2 pr-10 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleShowApiKey(provider.id)}
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                            >
                                                                {showApiKeys[provider.id] ? (
                                                                    <EyeOff className="w-4 h-4" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        
                                                        <Button
                                                            onClick={() => handleTestApiKey(provider.id)}
                                                            disabled={!newApiKeys[provider.id]?.trim() || isValidating}
                                                            variant="outline"
                                                            size="sm"
                                                            className="px-3"
                                                        >
                                                            {isValidating ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                            )}
                                                            Test
                                                        </Button>
                                                        
                                                        <Button
                                                            onClick={() => handleSaveApiKey(provider.id)}
                                                            disabled={!newApiKeys[provider.id]?.trim() || isValidating}
                                                            size="sm"
                                                            className="px-3"
                                                        >
                                                            {isValidating ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Key className="w-4 h-4 mr-1" />
                                                            )}
                                                            Save
                                                        </Button>
                                                        
                                                        {apiKeys[provider.id] && (
                                                            <Button
                                                                onClick={() => handleRemoveApiKey(provider.id)}
                                                                variant="destructive"
                                                                size="sm"
                                                                className="px-3"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Status Messages */}
                                                    {saveMessage && (
                                                        <div className={`text-xs p-2 rounded ${
                                                            saveMessage.type === 'success' 
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : 'bg-red-50 text-red-700 border border-red-200'
                                                        }`}>
                                                            {saveMessage.message}
                                                        </div>
                                                    )}
                                                    
                                                    {status.tested && !saveMessage && (
                                                        <div className={`text-xs p-2 rounded ${
                                                            status.valid 
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : 'bg-red-50 text-red-700 border border-red-200'
                                                        }`}>
                                                            {status.valid ? 'API key is valid and working' : status.error || 'API key validation failed'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'prompt' && (
                        <div>
                            <label htmlFor="system-prompt" className="block text-sm font-medium text-slate-700 mb-2">
                                AI System Prompt
                            </label>
                            <p className="text-sm text-slate-500 mb-4">
                                This prompt instructs the AI on how to analyze your code. You can customize it to focus on specific aspects of the review.
                            </p>
                            <textarea
                                id="system-prompt"
                                value={localPrompt}
                                onChange={(e) => setLocalPrompt(e.target.value)}
                                className="w-full h-48 bg-slate-50 text-slate-800 font-mono text-sm p-4 rounded-md resize-y border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                placeholder="Enter the instructions for the AI code reviewer..."
                            />
                            <div className="flex items-center justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={handlePromptReset}>
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Reset to Default
                                </Button>
                                <Button onClick={handlePromptSave} className="min-w-[100px]">
                                    <Save className="w-4 h-4 mr-2" />
                                    {isPromptSaved ? 'Saved!' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsModal;
