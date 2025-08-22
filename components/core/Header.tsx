import React from 'react';
import Button from '../ui/Button';

const Header: React.FC = () => {
  return (
    <header className="relative z-20 flex items-center justify-between p-6">
      {/* Logo */}
      <div className="flex items-center">
        <svg
          fill="currentColor"
          viewBox="0 0 147 70"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-10 h-10 -translate-x-0.5 text-white"
        >
          <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"></path>
          <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.3828 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C136.814 0 147 8.81439 147 19.6875V56Z"></path>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-2">
        
          href="#features"
          className="text-white/80 hover:text:-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Features
        </a>
        
          href="#pricing"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Pricing
        </a>
        
          href="#docs"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-2xl hover:bg-white/10 transition-all duration-200"
        >
          Docs
        </a>
      </nav>

      {/* Login Button Group with Arrow - Enhanced for better compatibility */}
      <div 
        className="relative flex items-center group" 
        style={{ filter: "url(#gooey-filter)" }}
      >
        {/* Arrow Button */}
        <button 
          className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center justify-center z-0 transform -translate-x-10 group-hover:-translate-x-20"
          aria-label="Navigate to login"
        >
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 17L17 7M17 7H7M17 7V17" 
            />
          </svg>
        </button>

        {/* Main Login Button */}
        <Button 
          glow
          glowColor="blue"
          className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center z-10 relative"
          onClick={() => {
            // Add your login logic here
            console.log("Login clicked");
          }}
        >
          Login
        </Button>
      </div>
    </header>
  );
};

export default Header;


