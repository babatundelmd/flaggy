import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

import { twMerge } from 'tailwind-merge';

interface OptionButtonProps {
    text: string;
    onClick: () => void;
    status?: 'correct' | 'wrong' | 'idle';
    disabled?: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ text, onClick, status = 'idle', disabled }) => {
    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, translateY: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={twMerge(
                'btn btn-option justify-between px-6',
                status === 'correct' && 'correct',
                status === 'wrong' && 'wrong'
            )}
        >
            <span>{text}</span>
            {status === 'correct' && <Check size={20} />}
            {status === 'wrong' && <X size={20} />}
        </motion.button>
    );
};
