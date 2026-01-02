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

    it('should prioritize distractors from the same subregion', () => {
        const extraCountries: Country[] = [
            { name: { common: 'Senegal', official: 'Republic of Senegal' }, cca3: 'SEN', flags: { svg: '', png: '', alt: '' }, region: 'Africa', subregion: 'Western Africa', population: 16000000 },
            { name: { common: 'Gambia', official: 'Republic of the Gambia' }, cca3: 'GMB', flags: { svg: '', png: '', alt: '' }, region: 'Africa', subregion: 'Western Africa', population: 2400000 },
            { name: { common: 'Ghana', official: 'Republic of Ghana' }, cca3: 'GHA', flags: { svg: '', png: '', alt: '' }, region: 'Africa', subregion: 'Western Africa', population: 31000000 },
            { name: { common: 'USA', official: 'United States of America' }, cca3: 'USA', flags: { svg: '', png: '', alt: '' }, region: 'Americas', subregion: 'North America', population: 331000000 },
        ];
        const allCountries = [...mockCountries, ...extraCountries];
        const senegal = extraCountries[0];

        const question = generateQuestion(allCountries, senegal);

        expect(question.options).toContain(senegal);
        expect(question.options.map(o => o.cca3)).toContain('GMB');
        expect(question.options.map(o => o.cca3)).toContain('GHA');
        expect(question.options.map(o => o.cca3)).not.toContain('USA');
    });
});
