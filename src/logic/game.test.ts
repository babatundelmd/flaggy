import { describe, it, expect } from 'vitest';
import { generateQuestion } from './game';
import type { Country } from '../types/country';

describe('generateQuestion', () => {
    const mockCountries: Country[] = [
        { name: { common: 'France', official: 'French Republic' }, cca3: 'FRA', flags: { svg: '', png: '', alt: '' }, region: 'Europe', subregion: 'Western Europe', population: 67000000 },
        { name: { common: 'Germany', official: 'Federal Republic of Germany' }, cca3: 'DEU', flags: { svg: '', png: '', alt: '' }, region: 'Europe', subregion: 'Western Europe', population: 83000000 },
        { name: { common: 'Italy', official: 'Italian Republic' }, cca3: 'ITA', flags: { svg: '', png: '', alt: '' }, region: 'Europe', subregion: 'Southern Europe', population: 60000000 },
        { name: { common: 'Spain', official: 'Kingdom of Spain' }, cca3: 'ESP', flags: { svg: '', png: '', alt: '' }, region: 'Europe', subregion: 'Southern Europe', population: 47000000 },
    ];

    it('should generate a question with the correct country', () => {
        const correctCountry = mockCountries[0];
        const question = generateQuestion(mockCountries, correctCountry);

        expect(question.correctCountry).toBe(correctCountry);
    });

    it('should generate 3 options', () => {
        const correctCountry = mockCountries[0];
        const question = generateQuestion(mockCountries, correctCountry);

        expect(question.options).toHaveLength(3);
    });

    it('should contain the correct country in options', () => {
        const correctCountry = mockCountries[0];
        const question = generateQuestion(mockCountries, correctCountry);

        expect(question.options).toContain(correctCountry);
    });

    it('should shuffle options', () => {
        // This is a probabilistic test, but good for a sanity check
        const correctCountry = mockCountries[0];
        const initialOrder = [correctCountry, mockCountries[1], mockCountries[2]];

        let shuffledAtLeastOnce = false;
        for (let i = 0; i < 10; i++) {
            const question = generateQuestion(mockCountries, correctCountry);
            if (JSON.stringify(question.options) !== JSON.stringify(initialOrder)) {
                shuffledAtLeastOnce = true;
                break;
            }
        }
        expect(shuffledAtLeastOnce).toBe(true);
    });
});
