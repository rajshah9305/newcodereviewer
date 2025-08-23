// components/core/EnhancedSettingsModal.tsx - Styled to match your theme
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Shield, Key, AlertTriangle, CheckCircle,
  Plus, Trash2, Eye, EyeOff, Download, Upload, Settings2,
  Loader2, Clock, Activity, RefreshCw
} from 'lucide-react';
import Button from '../ui/Button';
import { useSettings } from '../../hooks/useSettings';
import { cn } from '../../lib/utils';

interface EnhancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedSettingsModal: React.FC<EnhancedSettingsModalProps> = ({ isOpen, onClose }) => {
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

  const [activeTab, setActiveTab] = useState<'ai' | 'prompt' | 'security'>('ai');
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [isPromptSaved, setIsPromptSaved] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({});
  const [newApiKeys, setNewApiKeys] = useState<{[key: string]: string}>({});
  const [saveMessages, setSaveMessages] = useState<{[key: string]: { type: 'success' | 'error', message: string }}>({});
  const [keyMetadata, setKeyMetadata] = useState<{[key: string]: { created: number; lastUsed?: number; usageCount: number }}>({});
  const [selectedKeys, setSelectedKeys] = useState<{[key: string]: boolean}>({});

  // Load metadata from localStorage
  useEffect(() => {
    if (isOpen) {
      setLocalPrompt(prompt);
      const initialKeys: {[key: string]: string} = {};
      providers.forEach(provider => {
        initialKeys[provider.id] = apiKeys[provider.id] || '';
      });
      setNewApiKeys(initialKeys);
      setSaveMessages({});
      
      // Load key metadata
      try {
        const storedMetadata = localStorage.getItem('api_key_metadata');
        if (storedMetadata) {
          setKeyMetadata(JSON.parse(storedMetadata));
        }
      } catch (error) {
        console.error('Failed to load key metadata:', error);
      }
    }
  }, [prompt, isOpen, apiKeys, providers]);

  const updateKeyMetadata = (providerId: string, updates: Partial<{ created: number; lastUsed: number; usageCount: number }>) => {
    setKeyMetadata(prev => {
      const newMetadata = {
        ...prev,
        [providerId]: { ...prev[providerId], ...updates }
      };
      try {
        localStorage.setItem('api_key_metadata', JSON.stringify(newMetadata));
      } catch (error) {
        console.error('Failed to save key metadata:', error);
      }
      return newMetadata;
    });
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
        
        // Update metadata
        updateKeyMetadata(providerId, { 
          created: Date.now(), 
          usageCount: 0 
        });
        
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
      setSaveMessages(prev => ({ ...prev,
        [providerId]: { type: 'error', message: 'Failed to validate API key' }
      }));
    }
  };

  const handleBulkDelete = () => {
    const selectedProviders = Object.keys(selectedKeys).filter(key => selectedKeys[key]);
    selectedProviders.forEach(providerId => {
      removeAPIKey(providerId);
      setKeyMetadata(prev => {
        const newMetadata = { ...prev };
        delete newMetadata[providerId];
        try {
          localStorage.setItem('api_key_metadata', JSON.stringify(newMetadata));
        } catch (error) {
          console.error('Failed to save metadata:', error);
        }
        return newMetadata;
      });
    });
    setSelectedKeys({});
  };

  const handleExportKeys = () => {
    const exportData = {
      keys: apiKeys,
      metadata: keyMetadata,
      config: aiConfig,
      exported: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elite-ai-keys-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCount = Object.values(selectedKeys).filter(Boolean).length;
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
        {/* Header - Matching your existing style */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 rounded-lg border border-sky-200">
              <Shield className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Enhanced Configuration</h2>
              <p className="text-sm text-slate-500">Secure API key management & settings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConfigured() && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs">
                <CheckCircle className="w-3 h-3 text-green-60" />
                <span className="text-green-700 font-medium">Ready</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
              <X className="w-5 h-5 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation - Matching your existing style */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('ai')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'ai'
                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Key className="w-4 h-4" />
            API Management
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'prompt'
                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Settings2 className="w-4 h-4" />
            System Prompt
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'security'
                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Shield className="w-4 h-4" />
            Security & Backup
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Bulk Operations Toolbar - Matches your design */}
              <AnimatePresence>
                {selectedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-4 bg-sky-50 border border-sky-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sky-600" />
                      <span className="text-sm font-medium text-sky-700">
                        {selectedCount} provider{selectedCount !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={handleExportKeys}>
                        <Download className="w-4 h-4 mr-1" />
                        Export Selected
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete Selected
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current Configuration Status - Matches your existing cards */}
              <div className={cn(
                'p-4 rounded-xl border-2',
                isConfigured() 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-200'
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    isConfigured() ? 'bg-green-500' : 'bg-amber-500'
                  )} />
                  <span className="font-medium text-sm text-slate-800">
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

              {/* Enhanced API Keys Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    API Keys Management
                  </label>
                  <Button size="sm" variant="outline" onClick={handleExportKeys}>
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {providers.map((provider) => {
                    const status = getAPIKeyStatus(provider.id);
                    const isValidating = isValidatingKey[provider.id];
                    const saveMessage = saveMessages[provider.id];
                    const metadata = keyMetadata[provider.id];
                    const hasKey = apiKeys[provider.id];
                    const isSelected = selectedKeys[provider.id];
                    
                    return (
                      <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected || false}
                                onChange={(e) => setSelectedKeys(prev => ({
                                  ...prev,
                                  [provider.id]: e.target.checked
                                }))}
                                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                              />
                              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {provider.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{provider.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{provider.models.length} models</span>
                                {metadata && (
                                  <>
                                    <span>•</span>
                                    <span>Added {new Date(metadata.created).toLocaleDateString()}</span>
                                    {metadata.lastUsed && (
                                      <>
                                        <span>•</span>
                                        <span>Used {metadata.usageCount} times</span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {hasKey && status.valid && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3" />
                                <span>Active</span>
                              </div>
                            )}
                            {aiConfig.provider === provider.id && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-800 rounded-full text-xs">
                                <Activity className="w-3 h-3" />
                                <span>Current</span>
                              </div>
                            )}
                            {isValidating && (
                              <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label htmlFor={`api-key-${provider.id}`} className="block text-xs font-medium text-slate-700 mb-1">API Key</label>
                              <div className="relative">
                                <input
                                  id={`api-key-${provider.id}`}
                                  type={showApiKeys[provider.id] ? 'text' : 'password'}
                                  value={newApiKeys[provider.id] || ''}
                                  onChange={(e) => setNewApiKeys(prev => ({
                                    ...prev,
                                    [provider.id]: e.target.value
                                  }))}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
                                  placeholder="Enter API Key"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowApiKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                                >
                                  {showApiKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleSaveApiKey(provider.id)}
                              disabled={isValidating}
                              className="self-end"
                            >
                              {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save
                            </Button>
                            {hasKey && (
                              <Button
                                variant="destructive"
                                onClick={() => removeAPIKey(provider.id)}
                                className="self-end"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </Button>
                            )}
                          </div>
                          {saveMessage && (
                            <div className={cn(
                              'text-sm mt-2',
                              saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                            )}>
                              {saveMessage.message}
                            </div>
                          )}

                          {/* Model Selection Dropdown */}
                          {hasKey && status.valid && (
                            <div className="mt-4">
                              <label htmlFor={`model-select-${provider.id}`} className="block text-xs font-medium text-slate-700 mb-1">Select Model</label>
                              <select
                                id={`model-select-${provider.id}`}
                                value={aiConfig.provider === provider.id ? aiConfig.model : ''}
                                onChange={(e) => updateAIConfig({
                                  provider: provider.id,
                                  model: e.target.value
                                })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
                              >
                                {getAvailableModels().map(model => (
                                  <option key={model} value={model}>{model}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="system-prompt" className="block text-sm font-medium text-slate-700 mb-1">System Prompt</label>
                <textarea
                  id="system-prompt"
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm min-h-[150px]"
                  placeholder="Enter system prompt here..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetPrompt}>
                  Reset to Default
                </Button>
                <Button onClick={() => {
                  savePrompt(localPrompt);
                  setIsPromptSaved(true);
                  setTimeout(() => setIsPromptSaved(false), 3000);
                }}>
                  {isPromptSaved ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {isPromptSaved ? 'Saved!' : 'Save Prompt'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Security & Backup</h3>
                <p className="text-sm text-blue-700">This section will allow you to export and import your API keys and settings for backup and migration purposes.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleExportKeys}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All Settings
                </Button>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSettingsModal;


