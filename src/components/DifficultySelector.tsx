import React from 'react';
import type { Difficulty } from '../types/country';

interface DifficultySelectorProps {
    current: Difficulty;
    onSelect: (d: Difficulty) => void;
}

const levels: { id: Difficulty; label: string }[] = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
    { id: 'genius', label: 'Genius' },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ current, onSelect }) => {
    return (
        <select
            value={current}
            onChange={(e) => onSelect(e.target.value as Difficulty)}
            className="form-select"
        >
            {levels.map((level) => (
                <option key={level.id} value={level.id}>
                    {level.label}
                </option>
            ))}
        </select>
    );
};
