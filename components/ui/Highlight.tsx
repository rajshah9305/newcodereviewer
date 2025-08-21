
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface HighlightProps {
  children: React.ReactNode;
  className?: string;
}

export const Highlight: React.FC<HighlightProps> = ({ children, className }) => {
  return (
    <motion.span
      initial={{ backgroundSize: '0% 100%' }}
      animate={{ backgroundSize: '100% 100%' }}
      transition={{
        duration: 2,
        ease: 'linear',
        delay: 0.5,
      }}
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        display: 'inline',
      }}
      className={cn(
        'relative inline-block pb-1 px-2 rounded-lg bg-gradient-to-r from-sky-500 to-slate-800',
        className
      )}
    >
      {children}
    </motion.span>
  );
};

export default Highlight;
