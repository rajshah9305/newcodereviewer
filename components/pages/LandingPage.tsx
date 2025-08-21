import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Github } from 'lucide-react';
import Button from '../ui/Button';
import HeroHighlight from '../core/HeroHighlight';
import Highlight from '../ui/Highlight';
import AnimatedText from '../core/AnimatedText';
import TextGlitch from '../core/TextGlitch';
import Footer from '../core/Footer';

interface LandingPageProps {
  onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const codeSnippet = `async function optimizeCodebase(files: CodeFile[]) {
  // Neural AI analyzes patterns and suggests optimizations
  const analysis = await neuralAnalyzer.process(files);

  return analysis.optimize({
    performance: true,
    security: "elite",
    intelligence: 10
  });
}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <HeroHighlight containerClassName="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-slate-800" />
            <span className="text-sm text-slate-500 font-medium">Powered by Gemini</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-slate-900">
            Elite Code{" "} <Highlight className="text-white">Review Platform</Highlight>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            Transform your codebase with neural-powered analysis, quantum optimization suggestions, and real-time intelligence.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Button size="lg" onClick={onLaunch}>
              <Zap className="w-5 h-5 mr-2" /> Launch Neural Review
            </Button>
            <Button as="a" href="https://github.com" target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
              <Github className="w-5 h-5 mr-2" /> View on GitHub
            </Button>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }} className="max-w-4xl mx-auto group">
            <div className="relative rounded-xl shadow-2xl shadow-slate-900/10">
                <div className="absolute inset-0 -z-10 border border-slate-900/20 rounded-xl transition-all duration-500 blur-sm group-hover:border-slate-900/50 group-hover:blur-md"></div>
                <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-sm text-slate-500 font-mono">neural-optimizer.ts</span>
                        </div>
                        <div className="px-3 py-1 bg-sky-500/10 text-sky-700 rounded-full text-xs font-medium border border-sky-500/20">AI Enhanced</div>
                    </div>
                    <div className="text-sm text-left font-mono p-4 bg-slate-50 rounded-lg overflow-x-auto min-h-[210px]">
                        <AnimatePresence>
                            {isTyping ? (<AnimatedText text={codeSnippet} />) : (<div className="w-full h-full flex items-center justify-center text-slate-400">Initializing AI...</div>)}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      </HeroHighlight>
      <Footer />
    </motion.div>
  );
};

export default LandingPage;
