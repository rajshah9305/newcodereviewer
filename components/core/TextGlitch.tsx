
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface TextGlitchProps {
  text: string;
  hoverText: string;
  href?: string;
  className?: string;
  isSmall?: boolean;
}

const TextGlitch: React.FC<TextGlitchProps> = ({
  text,
  hoverText,
  href,
  className = '',
  isSmall = false,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<number | null>(null);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const scramble = (targetText: string) => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        targetText
          .split('')
          .map((_letter, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join('')
      );
      if (iteration >= targetText.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const content = (
    <h2
      className={cn(
        'font-mono font-black tracking-widest uppercase',
        'transition-colors duration-500',
        isSmall
          ? 'text-2xl md:text-3xl text-slate-600 hover:text-slate-900'
          : 'text-4xl md:text-5xl lg:text-6xl text-slate-300 hover:text-white',
        className
      )}
      onMouseEnter={() => scramble(hoverText)}
      onMouseLeave={() => scramble(text)}
    >
      {displayText}
    </h2>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline">
      {content}
    </a>
  ) : (
    content
  );
};

export default TextGlitch;
