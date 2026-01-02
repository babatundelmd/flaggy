import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Trophy, MapPin, User as UserIcon, Timer, Loader2 } from 'lucide-react';
import { subscribeToLeaderboard, type LeaderboardEntry, type TimeFrame, type Scope } from '../logic/leaderboard';
import { useAuth } from '../contexts/AuthContext';
import type { Difficulty } from '../types/country';

interface LeaderboardProps {
    difficulty: Difficulty;
    userCountry: string;
}

export const Leaderboard = ({ difficulty, userCountry }: LeaderboardProps) => {
    const { user } = useAuth();
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
    const [scope, setScope] = useState<Scope>('global');
    const [scores, setScores] = useState<LeaderboardEntry[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        setLoading(true);
        setScores(null);
        setPage(0);

        const unsubscribe = subscribeToLeaderboard(
            difficulty,
            timeFrame,
            scope,
            userCountry,
            (data) => {
                // Deduplicate by UID (keep highest score)
                const unique: Record<string, LeaderboardEntry> = {};
                data.forEach(entry => {
                    if (!unique[entry.uid]) {
                        unique[entry.uid] = entry;
                    } else {
                        // If user already exists, check if this new entry is better
                        // Order is Score DESC, Time ASC
                        const current = unique[entry.uid];
                        if (entry.score > current.score) {
                            unique[entry.uid] = entry;
                        } else if (entry.score === current.score && entry.averageTime < current.averageTime) {
                            unique[entry.uid] = entry;
                        }
                    }
                });
                // Convert back to array and sort 
                const sorted = Object.values(unique).sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.averageTime - b.averageTime;
                });

                setScores(sorted);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [difficulty, timeFrame, scope, userCountry]);

    return (
        <div className="leaderboard" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Trophy size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0 }}>Leaderboard</h3>
            </div>

            {/* Scope Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.3)', padding: '0.25rem', borderRadius: '12px' }}>
                <button
                    onClick={() => {
                        if (scope !== 'global') {
                            setScores(null);
                            setLoading(true);
                            setPage(0);
                            setScope('global');
                        }
                    }}
                    className={`tab-btn ${scope === 'global' ? 'active' : ''}`}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: scope === 'global' ? '2px solid var(--primary)' : '1px solid transparent', // Added border
                        background: scope === 'global' ? 'white' : 'transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: scope === 'global' ? 'var(--primary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease',
                        boxShadow: scope === 'global' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    <Globe size={14} /> Global
                </button>
                <button
                    onClick={() => {
                        if (scope !== 'country') {
                            setScores(null);
                            setLoading(true);
                            setPage(0);
                            setScope('country');
                        }
                    }}
                    className={`tab-btn ${scope === 'country' ? 'active' : ''}`}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: scope === 'country' ? '2px solid var(--primary)' : '1px solid transparent', // Added border
                        background: scope === 'country' ? 'white' : 'transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: scope === 'country' ? 'var(--primary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease',
                        boxShadow: scope === 'country' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    <MapPin size={14} /> {userCountry}
                </button>
            </div>

            {/* TimeFrame Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                {(['daily', 'weekly', 'all-time'] as TimeFrame[]).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => {
                            if (timeFrame !== tf) {
                                setScores(null);
                                setLoading(true);
                                setPage(0);
                                setTimeFrame(tf);
                            }
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: timeFrame === tf ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: timeFrame === tf ? '700' : '500',
                            textTransform: 'capitalize',
                            position: 'relative',
                            paddingBottom: '0.25rem'
                        }}
                    >
                        {tf.replace('-', ' ')}
                        {timeFrame === tf && (
                            <motion.div
                                layoutId="underline"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: 'var(--primary)',
                                    borderRadius: '1px'
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '16px', overflow: 'hidden' }}>
                {loading || scores === null ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={24} />
                    </div>
                ) : scores.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', gap: '0.5rem' }}>
                        <Trophy size={32} style={{ opacity: 0.3 }} />
                        <p>No scores yet.</p>
                        <p style={{ fontSize: '0.8rem' }}>Be the first!</p>
                    </div>
                ) : (
                    <>
                        <div className="scores-list">
                            {scores.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((entry, index) => {
                                const realIndex = page * ITEMS_PER_PAGE + index;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={entry.id || realIndex}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2rem 1fr auto auto',
                                            gap: '0.5rem',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                                            background: user?.uid === entry.uid ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <span style={{ fontWeight: '700', color: realIndex < 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
                                            #{realIndex + 1}
                                        </span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {entry.photoURL ? (
                                                <img src={entry.photoURL} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                            ) : (
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <UserIcon size={14} color="#999" />
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <img
                                                    src={`https://flagcdn.com/w20/${entry.country.toLowerCase()}.png`}
                                                    alt={entry.country}
                                                    style={{ width: '16px', borderRadius: '2px', objectFit: 'cover' }}
                                                />
                                                <span style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                                                    {entry.displayName.split(' ')[0]}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--primary)', lineHeight: 1 }}>{entry.score} pts</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1 }}>{Math.round(entry.accuracy)}%</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: '4rem', justifyContent: 'flex-end' }}>
                                            <Timer size={12} />
                                            <span>{entry.averageTime}s</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        {scores.length > ITEMS_PER_PAGE && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        color: page === 0 ? 'var(--text-muted)' : 'var(--primary)',
                                        cursor: page === 0 ? 'default' : 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        opacity: page === 0 ? 0.5 : 1
                                    }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {page + 1} / {Math.ceil(scores.length / ITEMS_PER_PAGE)}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(Math.ceil(scores.length / ITEMS_PER_PAGE) - 1, p + 1))}
                                    disabled={(page + 1) * ITEMS_PER_PAGE >= scores.length}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        color: (page + 1) * ITEMS_PER_PAGE >= scores.length ? 'var(--text-muted)' : 'var(--primary)',
                                        cursor: (page + 1) * ITEMS_PER_PAGE >= scores.length ? 'default' : 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        opacity: (page + 1) * ITEMS_PER_PAGE >= scores.length ? 0.5 : 1
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
