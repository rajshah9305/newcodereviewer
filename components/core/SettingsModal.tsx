// components/core/SettingsModal.tsx - Enhanced with better model selection feedback
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCcw, Eye, EyeOff, Trash2, Key, Bot, Settings2, CheckCircle, XCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
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
        getCurrentProvider,
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
        console.log('Switching to provider:', providerId);
        updateAIConfig({ provider: provider: providerId });
    };

    const handleModelChange = (model: string) => {
        console.log('Switching to model:', model);
        updateAIConfig({ model });
    };

    const handleSaveApiKey = async (providerId: string) => {
        const apiKey = newApiKeys[providerId]?.trim();
        if (!apiKey) {
            setSaveMessages(prev => ({
                ...prev,
                [providerId]: { type: 'error', message: 'API key cannot be empty' }
            }));
            return;
        }

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

    const currentProvider = getCurrentProvider();
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
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings" glow glowColor="purple">
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
                        <Settings2 className="w-4 h_4" />
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
                                        : 'Please select an AI provider and configure a key to continue.'
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
                                                            ? 'border-sky-500 bg-sky-50' + ' ring-2 ring-sky-500/20'
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

                            {/* ENHANCED Model Selection - Shows only current provider's models */}
                            {currentProvider && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Model for {currentProvider.name}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={aiConfig.model}
                                            onChange={(e) => handleModelChange(e.target.value)}
                                            className="w-full p-3 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none bg-white"
                                        >
                                            {availableModels.map((model) => (
                                                <option key={model} value={model}>
                                                    {model}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available for {currentProvider.name}
                                    </p>
                                </div>
                            )}

                            {/* API Keys Management - Rest of the component remains the same */}
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
                                                            Configured
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="relative flex-grow">
                                                        <input
                                                            type={showApiKeys[provider.id] ? 'text' : 'password'}
                                                            value={newApiKeys[provider.id]}
                                                            onChange={(e) => setNewApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                                                            placeholder={`Enter ${provider.name} API Key`}
                                                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleShowApiKey(provider.id)}
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                                                        >
                                                            {showApiKeys[provider.id] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleSaveApiKey(provider.id)}
                                                        disabled={isValidating || !newApiKeys[provider.id]}
                                                        size="sm"
                                                    >
                                                        {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleTestApiKey(provider.id)}
                                                        disabled={isValidating || !newApikeys[provider.id]}
                                                        size="sm"
                                                    >
                                                        Test
                                                    </Button>
                                                    {apiKeys[provider.id] && (
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleRemoveApiKey(provider.id)}
                                                            size="sm"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                {saveMessage && (
                                                    <p className={`mt-2 text-sm ${
                                                        saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {saveMessage.message}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'prompt' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 mb-2">
                                    System Prompt
                                </label>
                                <textarea
                                    id="system-prompt"
                                    rows={10}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    value={localPrompt}
                                    onChange={(e) => setLocalPrompt(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={handlePromptReset}
                                    disabled={localPrompt === prompt}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                                <Button
                                    onClick={handlePromptSave}
                                    disabled={localPrompt === prompt}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {isPromptSaved ? 'Saved!' : 'Save Prompt'}
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


