import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlagCardProps {
    flagUrl: string;
    altText?: string;
}

export const FlagCard: React.FC<FlagCardProps> = ({ flagUrl, altText }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={flagUrl}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flag-container"
            >
                <img src={flagUrl} alt={altText || 'Flag'} className="flag-image" />
            </motion.div>
        </AnimatePresence>
    );
};
