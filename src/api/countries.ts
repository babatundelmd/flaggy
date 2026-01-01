import type { Country } from '../types/country';

const BASE_URL = 'https://restcountries.com/v3.1';

export const fetchAllCountries = async (): Promise<Country[]> => {
    const response = await fetch(`${BASE_URL}/all?fields=name,flags,cca3,region,subregion,population`);
    if (!response.ok) {
        throw new Error('Failed to fetch countries');
    }
    return response.json();
};
