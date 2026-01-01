import posthog from 'posthog-js';
import type { Difficulty } from '../types/country';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export const initPostHog = () => {
    if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            autocapture: true,
            capture_pageview: true,
            persistence: 'localStorage',
        });
    } else {
        console.warn('PostHog API key missing. Analytics will not be sent.');
    }
};

export const trackGameStart = (difficulty: Difficulty, region: string, subregion: string) => {
    posthog.capture('game_started', {
        difficulty,
        region,
        subregion,
    });
};

export const trackGuess = (params: {
    country: string,
    cca3: string,
    isCorrect: boolean,
    difficulty: Difficulty,
    region: string,
    subregion: string,
    isTimeout: boolean
}) => {
    posthog.capture('flag_guessed', params);
};

export const trackDifficultyChange = (difficulty: Difficulty) => {
    posthog.capture('difficulty_changed', { difficulty });
};

export const trackRegionChange = (region: string, subregion: string) => {
    posthog.capture('region_changed', { region, subregion });
};
