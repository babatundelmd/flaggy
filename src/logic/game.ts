import type { Country, Question } from '../types/country';

export const generateQuestion = (countries: Country[], correctCountry: Country): Question => {
    // 1. Pick distractors from all countries except the chosen one
    const distractionPool = countries.filter(c => c.cca3 !== correctCountry.cca3);
    const distractors = [...distractionPool]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

    const options = [correctCountry, ...distractors].sort(() => Math.random() - 0.5);

    return {
        correctCountry,
        options
    };
};
