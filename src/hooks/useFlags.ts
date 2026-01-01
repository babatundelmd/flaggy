import { useQuery } from '@tanstack/react-query';
import { fetchAllCountries } from '../api/countries';
import { filterCountriesByDifficulty, filterCountriesByRegion } from '../logic/difficulty';
import type { Difficulty } from '../types/country';

export const useFlags = (difficulty: Difficulty, region: string, subregion: string) => {
    return useQuery({
        queryKey: ['countries', difficulty, region, subregion],
        queryFn: fetchAllCountries,
        select: (data) => {
            const filteredByDifficulty = filterCountriesByDifficulty(data, difficulty);
            return filterCountriesByRegion(filteredByDifficulty, region, subregion);
        },
    });
};
