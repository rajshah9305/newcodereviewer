import React, { FC, memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, AlertTriangle, Bug, Lightbulb, ShieldCheck, Paintbrush, Zap } from 'lucide-react';

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
            <SyntaxHighlighter language={language} style={atomDark} PreTag="div" customStyle={{ margin: 0, borderRadius: '0.375rem', padding: '1rem' }}>
                {String(value).replace(/\n$/, '')}
            </SyntaxHighlighter>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-slate-700 text-slate-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label="Copy code to clipboard"
            >
                {hasCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
});

const FindingCard: FC<{ finding: Finding; index: number }> = ({ finding, index }) => {
    const iconMap = {
        Bug: <Bug className="w-5 h-5 text-red-500" />,
        Suggestion: <Lightbulb className="w-5 h-5 text-amber-500" />,
        Security: <ShieldCheck className="w-5 h-5 text-green-500" />,
        Style: <Paintbrush className="w-5 h-5 text-blue-500" />,
        Performance: <Zap className="w-5 h-5 text-purple-500" />,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-slate-200 rounded-lg shadow-sm mb-4 overflow-hidden"
        >
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                {iconMap[finding.type] || <AlertTriangle className="w-5 h-5 text-slate-500" />}
                <h3 className="text-md font-semibold text-slate-800">{finding.title}</h3>
            </div>
            <div className="p-4">
                <p className="text-slate-600 mb-4 text-sm leading-relaxed whitespace-pre-wrap">{finding.description}</p>
                {finding.code && (
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Suggested Code</h4>
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
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
                <h3 className="text-lg font-semibold mb-2 text-amber-800">Invalid Report Format</h3>
                <p className="max-w-md">The AI's response could not be displayed. This might be a temporary issue or the response was not in the expected structured format.</p>
                <details className="mt-4 text-xs text-left bg-slate-100 p-2 rounded w-full max-w-md">
                    <summary className="cursor-pointer font-medium">Show raw response</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all p-2 font-mono">{content}</pre>
                </details>
            </div>
        );
    }

    if (analysisData.findings.length === 0) {
      return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                <Check className="w-12 h-12 mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2 text-slate-700">No Issues Found</h3>
                <p>The AI analysis completed successfully and found no specific issues to report.</p>
            </div>
      );
    }

    return (
        <div>
            {analysisData.findings.map((finding, index) => (
                <FindingCard key={index} finding={finding} index={index} />
            ))}
        </div>
    );
};

export default AnalysisReportRenderer;