"use client";

import { useState, useEffect, useCallback } from "react";

const DIFFICULTY_STORAGE_KEY = "vietnamese_word_difficulty";

type DifficultyMap = { [word: string]: number };

// Helper to safely access localStorage
const getStoredDifficulties = (): DifficultyMap => {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const storedDifficulties = window.localStorage.getItem(DIFFICULTY_STORAGE_KEY);
    return storedDifficulties ? JSON.parse(storedDifficulties) : {};
  } catch (error) {
    console.error("Failed to load word difficulties from localStorage", error);
    return {};
  }
};

const setStoredDifficulties = (difficulties: DifficultyMap) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(DIFFICULTY_STORAGE_KEY, JSON.stringify(difficulties));
  } catch (error) {
    console.error("Failed to save word difficulties to localStorage", error);
  }
};


export function useWordDifficulty() {
  const [difficulties, setDifficulties] = useState<DifficultyMap>({});

  useEffect(() => {
    setDifficulties(getStoredDifficulties());
  }, []);

  const updateDifficulties = useCallback((newDifficulties: DifficultyMap) => {
    setDifficulties(newDifficulties);
    setStoredDifficulties(newDifficulties);
  }, []);

  const getDifficulty = useCallback((word: string) => {
    return difficulties[word] || 0;
  }, [difficulties]);

  const adjustDifficulty = useCallback((word: string, adjustment: number) => {
    const currentDifficulties = getStoredDifficulties();
    // Ensure score doesn't go below 0, and has a reasonable cap
    const newScore = Math.max(0, Math.min(10, (currentDifficulties[word] || 0) + adjustment));
    const newDifficulties = { ...currentDifficulties, [word]: newScore };
    updateDifficulties(newDifficulties);
  }, [updateDifficulties]);

  return { difficulties, getDifficulty, adjustDifficulty };
}
