import React from 'react';
import { Trophy, Timer } from 'lucide-react';

interface LeaderboardPlayer {
    id: string;
    name: string;
    avgTime: number;
    score: number;
}

const mockPlayers: LeaderboardPlayer[] = [
    { id: '1', name: 'FlagNinja', avgTime: 1.2, score: 98 },
    { id: '2', name: 'WorldExplorer', avgTime: 1.5, score: 95 },
    { id: '3', name: 'AtlasPro', avgTime: 1.8, score: 92 },
    { id: '4', name: 'MapWizard', avgTime: 2.1, score: 89 },
    { id: '5', name: 'GeoLearner', avgTime: 2.5, score: 85 },
];

export const Leaderboard: React.FC = () => {
    return (
        <div className="leaderboard">
            <h2 className="leaderboard-title">
                <Trophy size={20} style={{ color: '#f59e0b' }} />
                Global Top Speed
            </h2>
            <div className="leaderboard-list">
                {mockPlayers.map((player, index) => (
                    <div key={player.id} className="leaderboard-item">
                        <div className="rank-badge">{index + 1}</div>
                        <div className="player-info">
                            <div className="player-name">{player.name}</div>
                        </div>
                        <div className="player-time" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Timer size={14} />
                            {player.avgTime}s
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
