
import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className }) => {
    const lines = text.split('\n');
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.5 } }, // Stagger lines
    };
    const lineVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
    };

    const colorize = (char: string, fullLine: string): string => {
        const keywords = ['async', 'function', 'const', 'return', 'await', 'true'];
        const methods = ['process', 'optimize'];
        const numbers = ['10'];
        const types = ['CodeFile[]'];
        
        // Match the full word the character belongs to
        const wordMatch = fullLine.match(new RegExp(`\\b(\\w*${char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\w*)\\b`));
        const word = wordMatch ? wordMatch[1] : null;

        if (word && keywords.includes(word)) return 'text-purple-500 font-medium';
        if (word && methods.includes(word)) return 'text-sky-500';
        if (word && numbers.includes(word)) return 'text-amber-500';
        if (word && types.includes(word)) return 'text-teal-500';
        if (['{', '}', '(', ')', '[', ']'].includes(char)) return 'text-slate-500';
        return 'text-slate-700';
    };

    return (
        <motion.div className={className} variants={containerVariants} initial="hidden" animate="visible" aria-label={text}>
            {lines.map((line, lineIndex) => (
                <motion.div
                    key={lineIndex}
                    variants={lineVariants}
                    className="whitespace-pre"
                >
                    {line.split('').map((char, charIndex) => (
                        <span
                            key={`${lineIndex}-${charIndex}`}
                            className={`inline-block ${colorize(char, line)}`}
                        >
                            {char}
                        </span>
                    ))}
                </motion.div>
            ))}
        </motion.div>
    );
};

export default AnimatedText;


