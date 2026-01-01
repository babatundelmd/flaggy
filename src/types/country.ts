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
}

export interface Question {
  correctCountry: Country;
  options: Country[];
}
