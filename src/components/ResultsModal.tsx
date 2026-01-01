import React from 'react';
import { Trophy, RotateCcw, ArrowRight, Star } from 'lucide-react';

interface ResultsModalProps {
    score: number;
    totalQuestions: number;
    accuracy: number;
    onRepeat: () => void;
    onNextLevel: () => void;
    hasNextLevel: boolean;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
    score,
    totalQuestions,
    accuracy,
    onRepeat,
    onNextLevel,
    hasNextLevel
}) => {
    const isSuccess = accuracy >= 80;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '1.5rem',
                        borderRadius: '50%',
                        color: 'var(--primary)'
                    }}>
                        <Trophy size={48} />
                    </div>
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Level Complete!</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    You've seen all flags in this set.
                </p>

                <div className="results-accuracy">
                    {accuracy}%
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Score</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{score} / {totalQuestions}</span>
                    </div>
                    <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
                        <span style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: isSuccess ? 'var(--success)' : 'var(--error)'
                        }}>
                            {isSuccess ? 'Passed' : 'Try Again'}
                        </span>
                    </div>
                </div>

                <div className="modal-actions">
                    {isSuccess && hasNextLevel && (
                        <button onClick={onNextLevel} className="btn btn-primary">
                            <ArrowRight size={20} />
                            Next Level
                        </button>
                    )}

                    {!isSuccess && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Star size={16} fill="currentColor" />
                            Reach 80% accuracy to unlock next level
                        </div>
                    )}

                    <button onClick={onRepeat} className="btn btn-option" style={{ justifyContent: 'center', borderWidth: '2px' }}>
                        <RotateCcw size={20} />
                        {isSuccess ? 'Repeat Level' : 'Try Level Again'}
                    </button>
                </div>
            </div>
        </div>
    );
};
