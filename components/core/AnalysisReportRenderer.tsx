// components/core/AnalysisReportRenderer.tsx
import React, { FC, memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, AlertTriangle, Bug, Lightbulb, ShieldCheck, Paintbrush, Zap, Sparkles } from 'lucide-react';

// Interfaces for structured analysis data
interface Finding {
  type: 'Bug' | 'Suggestion' | 'Security' | 'Style' | 'Performance';
  title: string;
  description: string;
  code?: string;
}

interface AnalysisData {
    findings: Finding[];
}

interface AnalysisReportRendererProps {
  content: string;
}

const CodeBlock: FC<{ language?: string; value: string }> = memo(({ language = 'text', value }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(value);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        }
    };

    return (
        <div className="relative text-sm group">
            <SyntaxHighlighter 
                language={language} 
                style={atomDark} 
                PreTag="div" 
                customStyle={{ 
                    margin: 0, 
                    borderRadius: '0.75rem', 
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                }}
            >
                {String(value).replace(/\n$/, '')}
            </SyntaxHighlighter>
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-slate-700/80 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-400 backdrop-blur-sm hover:bg-slate-600/80"
                aria-label="Copy code to clipboard"
            >
                {hasCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
});

const FindingCard: FC<{ finding: Finding; index: number }> = ({ finding, index }) => {
    const iconMap = {
        Bug: { icon: Bug, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
        Suggestion: { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
        Security: { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
        Style: { icon: Paintbrush, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
        Performance: { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    };

    const config = iconMap[finding.type] || { icon: AlertTriangle, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
    const IconComponent = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white border border-slate-200/50 rounded-2xl shadow-sm mb-4 overflow-hidden hover:shadow-md transition-all duration-300"
        >
            <div className={`p-5 border-b border-slate-200/50 ${config.bg} flex items-center gap-3`}>
                <div className={`p-2 rounded-xl ${config.bg} border ${config.border}`}>
                    <IconComponent className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">{finding.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                        {finding.type}
                    </span>
                </div>
            </div>
            <div className="p-5">
                <p className="text-slate-700 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {finding.description}
                </p>
                {finding.code && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-sky-500" />
                            <h4 className="text-sm font-semibold text-slate-700">Suggested Implementation</h4>
                        </div>
                        <CodeBlock value={finding.code} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const AnalysisReportRenderer: React.FC<AnalysisReportRendererProps> = ({ content }) => {
    const analysisData = useMemo<AnalysisData | null>(() => {
        if (!content) return null;
        try {
            // The response text might be wrapped in ```json ... ```, so we need to extract it.
            const jsonString = content.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
            const parsed = JSON.parse(jsonString);
            // Basic validation to ensure it has the expected structure
            if (parsed && Array.isArray(parsed.findings)) {
                return parsed;
            }
            return null;
        } catch (error) {
            console.error("Failed to parse analysis JSON:", error);
            return null;
        }
    }, [content]);

    if (!analysisData) {
        // This handles both parsing errors and empty/malformed findings array
        const isEmpty = content.trim() === '' || content.trim() === '{}' || content.trim() === '[]' || content.trim() === '{"findings":[]}';
        if (isEmpty) return null; // Don't show an error for an empty but valid response

        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 mb-4">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-amber-800">Invalid Report Format</h3>
                <p className="max-w-md text-slate-600 mb-4">The AI's response could not be displayed. This might be a temporary issue or the response was not in the expected structured format.</p>
                <details className="mt-4 text-xs text-left bg-slate-100 p-3 rounded-xl w-full max-w-md border border-slate-200">
                    <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">Show raw response</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all p-3 font-mono text-slate-600 bg-white rounded-lg border border-slate-200 max-h-40 overflow-y-auto">{content}</pre>
                </details>
            </div>
        );
    }

    if (analysisData.findings.length === 0) {
      return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-6">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200 mb-4">
                    <Check className="w-12 h-12 text-green-500 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-700">No Issues Found</h3>
                <p className="text-slate-600">The AI analysis completed successfully and found no specific issues to report.</p>
                <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700 font-medium">✨ Your code looks great!</p>
                </div>
            </div>
      );
    }

    // Group findings by type for better organization
    const groupedFindings = analysisData.findings.reduce((acc, finding) => {
        if (!acc[finding.type]) {
            acc[finding.type] = [];
        }
        acc[finding.type].push(finding);
        return acc;
    }, {} as Record<string, Finding[]>);

    const typeOrder: Array<keyof typeof groupedFindings> = ['Bug', 'Security', 'Performance', 'Style', 'Suggestion'];

    return (
        <div className="space-y-1">
            {/* Summary Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-sky-50 to-purple-50 rounded-2xl border border-sky-200/50"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-sky-600" />
                    <h3 className="font-semibold text-slate-800">Analysis Summary</h3>
                </div>
                <p className="text-sm text-slate-600">
                    Found {analysisData.findings.length} item{analysisData.findings.length !== 1 ? 's' : ''} for review across {Object.keys(groupedFindings).length} categor{Object.keys(groupedFindings).length !== 1 ? 'ies' : 'y'}.
                </p>
            </motion.div>

            {/* Render findings by type */}
            {typeOrder.map((type) => {
                const findings = groupedFindings[type];
                if (!findings) return null;

                return (
                    <div key={type} className="mb-6">
                        {findings.map((finding, index) => (
                            <FindingCard 
                                key={`${type}-${index}`} 
                                finding={finding} 
                                index={index} 
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default AnalysisReportRenderer;
