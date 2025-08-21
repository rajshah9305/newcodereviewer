import React from 'react';
import { motion } from 'framer-motion';
import TextGlitch from './TextGlitch';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-center py-8 sm:py-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
                <TextGlitch text="ELITE.AI" hoverText="NEURAL.CODE" isSmall />
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }} className="text-xs sm:text-sm text-slate-500 mt-4">
                A Modern AI-Powered Application
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.4 }} className="text-xs sm:text-sm text-slate-500 mt-2">
                Developed by RAJ
            </motion.p>
        </footer>
    );
};

export default Footer;
