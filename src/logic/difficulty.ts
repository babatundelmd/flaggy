import type { Country, Difficulty } from '../types/country';

export const filterCountriesByDifficulty = (countries: Country[], difficulty: Difficulty): Country[] => {
    const sorted = [...countries].sort((a, b) => b.population - a.population);

    switch (difficulty) {
        case 'beginner':
            return sorted.slice(0, 50);
        case 'medium':
            return sorted.slice(0, 100);
        case 'hard':
            return sorted.slice(0, 200);
        case 'genius':
            return sorted;
        default:
            return sorted;
    }
};

export const filterCountriesByRegion = (countries: Country[], region: string, subregion: string): Country[] => {
    let filtered = countries;
    if (region && region !== 'all') {
        filtered = filtered.filter(c => c.region.toLowerCase() === region.toLowerCase());
    }
    if (subregion && subregion !== 'all') {
        filtered = filtered.filter(c => c.subregion.toLowerCase() === subregion.toLowerCase());
    }
    return filtered;
};
