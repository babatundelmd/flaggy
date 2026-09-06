//import type { Country } from '../types/country';

const BASE_URL = 'https://api.restcountries.com/countries/v5';

export const fetchAllCountries = async (): Promise<any> => {
    const response = await fetch(`${BASE_URL}`,
                                 { headers: { 'Authorization': 'Bearer rc_live_a11e5bd9187f4500bf1608adb79ac6e0' } });
    if (!response.ok) {
        throw new Error('Failed to fetch countries');
    }
    return response.json();
};
