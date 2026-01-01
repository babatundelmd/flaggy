import type { Country, Question } from '../types/country';

export const generateQuestion = (countries: Country[], correctCountry: Country): Question => {
    // 1. Prioritize distractors from the same subregion
    let distractionPool = countries.filter(
        c => c.cca3 !== correctCountry.cca3 && c.subregion === correctCountry.subregion
    );

    // 2. If subregion pool is too small, add countries from the same region
    if (distractionPool.length < 2) {
        const regionalDistractors = countries.filter(
            c => c.cca3 !== correctCountry.cca3 &&
                c.region === correctCountry.region &&
                !distractionPool.some(dp => dp.cca3 === c.cca3)
        );
        distractionPool = [...distractionPool, ...regionalDistractors];
    }

    // 3. If still too small, add any remaining countries
    if (distractionPool.length < 2) {
        const remainingDistractors = countries.filter(
            c => c.cca3 !== correctCountry.cca3 &&
                !distractionPool.some(dp => dp.cca3 === c.cca3)
        );
        distractionPool = [...distractionPool, ...remainingDistractors];
    }

    // 4. Shuffle and pick 2
    const distractors = [...distractionPool]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

    const options = [correctCountry, ...distractors].sort(() => Math.random() - 0.5);

    return {
        correctCountry,
        options
    };
};
