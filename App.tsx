
import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/pages/LandingPage';
import CodeReviewPage from './components/pages/CodeReviewPage';

type Page = 'landing' | 'review';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('landing');

    const handleLaunch = useCallback(() => {
        setCurrentPage('review');
    }, []);

    const handleBack = useCallback(() => {
        setCurrentPage('landing');
    }, []);

    return (
        <AnimatePresence mode="wait">
            {currentPage === 'landing' && (
                <LandingPage key="landing" onLaunch={handleLaunch} />
            )}
            {currentPage === 'review' && (
                <CodeReviewPage key="review" onBack={handleBack} />
            )}
        </AnimatePresence>
    );
};

export default App;
