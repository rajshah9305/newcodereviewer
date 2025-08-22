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
      setSaveMessages(prev => ({
        ...prev,
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
                <CheckCircle className="w-3 h-3 text-green-600" />
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
                            <div className="flex-1 relative">
                              <input
                                type={showApiKeys[provider.id] ? 'text' : 'password'}
                                value={newApiKeys[provider.id] || ''}
                                onChange={(e) => setNewApiKeys(prev => ({ 
                                  ...prev, 
                                  [provider.id]: e.target.value 
                                }))}
                                placeholder={`Enter ${provider.name} API key...`}
                                className="w-full p-3 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowApiKeys(prev => ({ 
                                  ...prev, 
                                  [provider.id]: !prev[provider.id] 
                                }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showApiKeys[provider.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            
                            <Button
                              onClick={() => handleSaveApiKey(provider.id)}
                              disabled={!newApiKeys[provider.id]?.trim() || isValidating}
                              size="default"
                              className="px-4"
                            >
                              {isValidating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Save
                            </Button>
                            
                            {hasKey && (
                              <Button
                                onClick={() => removeAPIKey(provider.id)}
                                variant="destructive"
                                size="default"
                                className="px-4"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          {/* Status Messages - Matches your existing styling */}
                          {saveMessage && (
                            <div className={cn(
                              'text-sm p-3 rounded-lg border',
                              saveMessage.type === 'success' 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            )}>
                              {saveMessage.message}
                            </div>
                          )}
                          
                          {status.tested && !saveMessage && (
                            <div className={cn(
                              'text-sm p-3 rounded-lg border',
                              status.valid 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            )}>
                              {status.valid ? 'API key is valid and working' : status.error || 'API key validation failed'}
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
                className="w-full h-48 bg-slate-50 text-slate-800 font-mono text-sm p-4 rounded-lg resize-y border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Enter the instructions for the AI code reviewer..."
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => { resetPrompt(); setLocalPrompt(prompt); }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
                <Button onClick={() => { savePrompt(localPrompt); setIsPromptSaved(true); setTimeout(() => setIsPromptSaved(false), 2000); }} className="min-w-[100px]">
                  <Save className="w-4 h-4 mr-2" />
                  {isPromptSaved ? 'Saved!' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Backup & Recovery</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Export your configuration and API keys for backup or transfer to another device.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleExportKeys}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Configuration
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Configuration
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Security Notice
                </h3>
                <p className="text-sm text-slate-700">
                  API keys are stored locally in your browser. For enhanced security in production environments, 
                  consider using environment variables or secure key management services.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSettingsModal;
