import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Difficulty } from '../types/country';

export interface LeaderboardEntry {
    id?: string;
    uid: string;
    displayName: string;
    photoURL: string;
    score: number;
    accuracy: number;
    averageTime: number; // in seconds
    difficulty: Difficulty;
    country: string; // ISO 2 code
    timestamp: Timestamp;
}

export type TimeFrame = 'daily' | 'weekly' | 'all-time';
export type Scope = 'global' | 'country';

const SCORES_COLLECTION = 'scores';

export const detectUserCountry = async (): Promise<string> => {
    const cached = localStorage.getItem('userCountry');
    const cacheTime = localStorage.getItem('userCountryTime');

    if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < 24 * 60 * 60 * 1000) {
            return cached;
        }
    }

    try {
        // Using ip-api.com - 15,000 requests/hour for free, no CORS issues
        const response = await fetch('http://ip-api.com/json/');
        const data = await response.json();
        const country = data.countryCode || 'US';

        // Cache the result
        localStorage.setItem('userCountry', country);
        localStorage.setItem('userCountryTime', Date.now().toString());

        return country;
    } catch (error) {
        console.warn('Failed to detect country:', error);
        return cached || 'NG';
    }
};

const getPeriodIds = () => {
    const now = new Date();
    const dayId = now.toISOString().split('T')[0]; // YYYY-MM-DD

    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const weekId = `${d.getUTCFullYear()}-W${weekNo}`;

    return { dayId, weekId };
};

export const submitScore = async (
    user: { uid: string; displayName: string | null; photoURL: string | null },
    score: number,
    accuracy: number,
    averageTime: number,
    difficulty: Difficulty,
    country: string
) => {
    try {
        const { dayId, weekId } = getPeriodIds();

        await addDoc(collection(db, SCORES_COLLECTION), {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL,
            score,
            accuracy: Number(accuracy.toFixed(1)),
            averageTime: Number(averageTime.toFixed(1)),
            difficulty,
            country: country.toUpperCase(),
            timestamp: Timestamp.now(),
            dayId,
            weekId
        });
    } catch (error) {
        console.error('Error submitting score:', error);
        throw error;
    }
};


export const subscribeToLeaderboard = (
    difficulty: Difficulty,
    timeFrame: TimeFrame,
    scope: Scope,
    userCountry: string | undefined,
    callback: (entries: LeaderboardEntry[]) => void
) => {
    const scoresRef = collection(db, SCORES_COLLECTION);
    let constraints: any[] = [
        where('difficulty', '==', difficulty)
    ];

    // Time Frame
    if (timeFrame === 'daily') {
        const { dayId } = getPeriodIds();
        constraints.push(where('dayId', '==', dayId));
    } else if (timeFrame === 'weekly') {
        const { weekId } = getPeriodIds();
        constraints.push(where('weekId', '==', weekId));
    }

    // Scope
    if (scope === 'country' && userCountry) {
        constraints.push(where('country', '==', userCountry));
    }

    constraints.push(orderBy('score', 'desc'));
    constraints.push(orderBy('averageTime', 'asc'));
    constraints.push(limit(20));

    const q = query(scoresRef, ...constraints);

    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry));
        callback(data);
    }, (error) => {
        console.error("Error fetching leaderboard:", error);
        callback([]);
    });
};
