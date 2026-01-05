export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca3: string;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  region: string;
  subregion: string;
  population: number;
}

export type Difficulty = 'beginner' | 'medium' | 'hard' | 'genius';

export interface GameState {
  score: number;
  totalQuestions: number;
  currentQuestion?: Question;
  difficulty: Difficulty;
  region: string;
  subregion: string;
  isPro?: boolean;
}

export interface Question {
  correctCountry: Country;
  options: Country[];
}
