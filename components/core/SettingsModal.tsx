import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    // System Prompt Settings
    const { prompt, savePrompt, resetPrompt } = useSettings();
    const [localPrompt, setLocalPrompt] = useState(prompt);
    const [isPromptSaved, setIsPromptSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalPrompt(prompt);
        }
    }, [prompt, isOpen]);

    const handlePromptSave = () => {
        savePrompt(localPrompt);
        setIsPromptSaved(true);
        setTimeout(() => setIsPromptSaved(false), 2000);
    };

    const handlePromptReset = () => {
        resetPrompt();
        // Since resetPrompt updates the source `prompt`, we need to update local state too.
        // We can grab it from useSettings's return value after it's been reset, but it's async.
        // A simpler way is to just set it to the default from the hook.
        // Let's assume the hook's reset function updates the `prompt` value reactively.
    };

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
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Analysis Settings</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
                        <X className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* System Prompt Section */}
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
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsModal;