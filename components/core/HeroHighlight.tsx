// components/core/HeroHighlight.tsx
import React from 'react';
import { useMotionValue, motion, useMotionTemplate } from 'framer-motion';
import { cn } from '../../lib/utils';

interface HeroHighlightProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const HeroHighlight: React.FC<HeroHighlightProps> = ({
  children,
  className,
  containerClassName,
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        'relative h-full flex items-center justify-center w-full group overflow-hidden',
        'bg-gradient-to-br from-white via-slate-50/50 to-white',
        containerClassName
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Base dot pattern */}
      <div className="absolute inset-0 bg-dot-thick-neutral-300/40 pointer-events-none" />
      
      {/* Interactive dot pattern */}
      <motion.div
        className="pointer-events-none bg-dot-thick-sky-500/60 absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
        }}
      />
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20 pointer-events-none" />
      
      {/* Content */}
      <div className={cn('relative z-20 w-full', className)}>{children}</div>
    </div>
  );
};

export default HeroHighlight;
