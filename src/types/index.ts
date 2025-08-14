export interface WordVariant {
  word: string;
  tone: string;
  meaning: string;
}

export interface WordGroup {
  base_spelling: string;
  note?: string;
  variants: WordVariant[];
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  wordToPlay: string;
  baseSpelling: string;
}
