import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LoaderCircle, Lightbulb, AlertTriangle, ArrowLeft, Brain, Settings } from 'lucide-react';
import Button from '../ui/Button';
import HeroHighlight from '../core/HeroHighlight';
import TextGlitch from '../core/TextGlitch';
import AnalysisReportRenderer from '../core/AnalysisReportRenderer';
import SettingsModal from '../core/SettingsModal';
import { analyzeCode } from '../../services/geminiService';
import { useSettings } from '../../hooks/useSettings';

interface CodeReviewPageProps {
  onBack: () => void;
}

const CodeReviewPage: React.FC<CodeReviewPageProps> = ({ onBack }) => {
    const [code, setCode] = useState("import React, { useState, useEffect } from 'react';\n\nfunction MyComponent() {\n  const [data, setData] = useState(null);\n  // This effect runs on every render, which is inefficient.\n  useEffect(() => {\n    fetch('https://api.example.com/data')\n      .then(res => res.json())\n      .then(setData);\n  });\n\n  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;\n}");
    const [analysis, setAnalysis] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { prompt } = useSettings();

    const handleReview = async () => {
        setIsLoading(true);
        setAnalysis("");
        setError("");

        try {
            const result = await analyzeCode(code, prompt);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setAnalysis("");
        } finally {
            setIsLoading(false);
        }
    };

    const openSettings = () => setIsSettingsOpen(true);

    return (
        <>
            <motion.div
                className="min-h-screen bg-white text-slate-900 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <HeroHighlight containerClassName="flex-grow">
                    <div className="flex flex-col h-full w-full">
                        <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-30">
                            <div className="container mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
                                <TextGlitch text="ELITE.AI" hoverText="REVIEW" isSmall={true} />
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={openSettings} aria-label="Open Settings">
                                        <Settings className="w-5 h-5 text-slate-600" />
                                    </Button>
                                    <Button variant="outline" onClick={onBack} className="px-3">
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                                    </Button>
                                </div>
                            </div>
                        </header>
                        
                        <main className="flex-grow p-4 sm:p-8">
                            <div className="container mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Code Input Section */}
                                <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.1}} className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-6 flex flex-col">
                                    <h2 className="text-xl font-bold mb-4 text-slate-800">Your Code</h2>
                                    <textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="flex-grow bg-slate-900 text-slate-100 font-mono text-sm p-4 rounded-md resize-none border border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[400px] lg:min-h-0"
                                        placeholder="Paste your code here..."
                                        aria-label="Code input"
                                    />
                                    <Button onClick={handleReview} disabled={isLoading || !code.trim()} className="mt-4 w-full">
                                        {isLoading ? (
                                            <><LoaderCircle className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
                                        ) : ( <><Zap className="w-5 h-5 mr-2"/> Review Code</> )}
                                    </Button>
                                </motion.div>

                                {/* Analysis Report Section */}
                                <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.2}} className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-6 flex flex-col min-h-[550px]">
                                    <h2 className="text-xl font-bold mb-4 text-slate-800">Analysis Report</h2>
                                    <div className="bg-slate-50 rounded-md p-4 flex-grow border border-slate-300 overflow-y-auto relative">
                                        <AnimatePresence>
                                            {isLoading && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-50/90 z-10 p-4 text-center">
                                                    <div className="relative flex flex-col items-center justify-center">
                                                        <div className="absolute w-24 h-24 border-2 border-sky-200 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                                                        <div className="absolute w-28 h-28 border-t-2 border-b-2 border-sky-400 rounded-full animate-spin"></div>
                                                        <Brain className="w-10 h-10 text-sky-500 relative" />
                                                    </div>
                                                    <p className="text-lg font-semibold mt-8 text-slate-700">AI is analyzing your code...</p>
                                                    <p className="text-sm text-slate-500">This may take a moment.</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {!isLoading && !analysis && (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                                                {error ? (
                                                    <>
                                                        <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
                                                        <h3 className="text-lg font-semibold mb-2 text-red-700">Analysis Failed</h3>
                                                        <p className="max-w-md">{error}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lightbulb className="w-12 h-12 mb-4 text-slate-400" />
                                                        <h3 className="text-lg font-semibold mb-2 text-slate-700">Code Review Feedback</h3>
                                                        <p>Your code analysis results will appear here.</p>
                                                        <p>Paste your code on the left and click "Review Code" to start.</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {analysis && <AnalysisReportRenderer content={analysis} />}
                                    </div>
                                </motion.div>
                            </div>
                        </main>
                    </div>
                </HeroHighlight>
            </motion.div>
            <AnimatePresence>
                {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

export default CodeReviewPage;