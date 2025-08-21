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
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <HeroHighlight containerClassName="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 text-center">
          {/* Enhanced Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                Elite Code
              </span>{" "}
              <Highlight className="text-white bg-gradient-to-r from-blue-600 to-cyan-600 px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
                Review
              </Highlight>{" "}
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }} 
            className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed"
          >
            Transform your codebase with neural-powered analysis, quantum optimization suggestions, and real-time intelligence.
          </motion.p>

          {/* Enhanced Buttons Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.6 }} 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 sm:mb-16"
          >
            <Button 
              size="lg" 
              onClick={onLaunch}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
            >
              <Brain className="w-5 h-5 mr-2" /> 
              Launch Neural Review
            </Button>
            <Button 
              as="a" 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              variant="outline" 
              size="lg"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 transition-all duration-300 px-8 py-4 text-lg font-semibold"
            >
              <Github className="w-5 h-5 mr-2" /> 
              View on GitHub
            </Button>
          </motion.div>
          
          {/* Enhanced Code Preview Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }} 
            className="max-w-4xl mx-auto group"
          >
            <div className="relative rounded-xl shadow-2xl shadow-blue-900/20">
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl transition-all duration-500 blur-sm group-hover:blur-md group-hover:from-blue-500/30 group-hover:to-cyan-500/30"></div>
              <div className="bg-slate-900/90 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4 sm:p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Zap className="h-4 w-4 text-blue-400" />
                      <span className="font-mono">neural-optimizer.ts</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/50">
                    AI Enhanced
                  </div>
                </div>
                <div className="text-sm text-left font-mono p-4 bg-slate-800/50 rounded-lg overflow-x-auto min-h-[210px] border border-blue-500/20">
                  <AnimatePresence>
                    {isTyping ? (
                      <AnimatedText text={codeSnippet} className="text-slate-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TextGlitch 
                          text="INITIALIZING" 
                          hoverText="NEURAL.AI" 
                          className="text-lg text-blue-400"
                          isSmall={true}
                        />
                      </div>
                    )}
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
