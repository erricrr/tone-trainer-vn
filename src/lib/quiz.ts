import { vietnameseWords } from "@/data/words";
import type { WordGroup, QuizQuestion } from "@/types";

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateQuiz(
  difficulties: { [word: string]: number },
  quizSize: number = 10
): QuizQuestion[] {
  // Filter out groups with fewer than 2 variants, as they can't form a meaningful question
  const eligibleGroups = vietnameseWords.filter(group => group.variants.length >= 2);

  // Weight groups based on the difficulty of their variants
  const weightedGroups = eligibleGroups.map(group => {
    const totalDifficulty = group.variants.reduce((sum, variant) => {
        // Higher difficulty means higher weight. Add 1 to avoid zero weight and give new words a chance.
        return sum + (difficulties[variant.word] || 0) + 1;
    }, 0);
    return { group, weight: totalDifficulty };
  });

  // Select groups for the quiz using weighted random sampling
  const selectedGroups: WordGroup[] = [];
  let tempWeightedGroups = [...weightedGroups];

  // Protect against trying to select more groups than are available
  const numToSelect = Math.min(quizSize, tempWeightedGroups.length);

  while (selectedGroups.length < numToSelect && tempWeightedGroups.length > 0) {
      const totalWeight = tempWeightedGroups.reduce((sum, item) => sum + item.weight, 0);
      if (totalWeight <= 0) break; // All remaining items have 0 weight
      
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < tempWeightedGroups.length; i++) {
          random -= tempWeightedGroups[i].weight;
          if (random <= 0) {
              selectedGroups.push(tempWeightedGroups[i].group);
              tempWeightedGroups.splice(i, 1);
              break;
          }
      }
  }

  // Create questions from the selected groups
  const quizQuestions = selectedGroups.map((group): QuizQuestion => {
    // Correct answer is a random variant from the group
    const correctVariant = group.variants[Math.floor(Math.random() * group.variants.length)];
    const options = group.variants.map(v => v.word);

    return {
      questionText: `Which word do you hear?`,
      wordToPlay: correctVariant.word,
      options: shuffleArray(options),
      correctAnswer: correctVariant.word,
      baseSpelling: group.base_spelling,
    };
  });

  return shuffleArray(quizQuestions);
}
