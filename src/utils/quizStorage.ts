import { QuizProgress, QuizSession, QuizStats } from '@/types/quiz';

const STORAGE_KEY = 'servicenow_quiz_progress';
const STATS_KEY = 'servicenow_quiz_stats';

export const saveQuizProgress = (progress: QuizProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving quiz progress:', error);
  }
};

export const loadQuizProgress = (): QuizProgress | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading quiz progress:', error);
    return null;
  }
};

export const clearQuizProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing quiz progress:', error);
  }
};

export const saveQuizStats = (stats: QuizStats[]): void => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving quiz stats:', error);
  }
};

export const loadQuizStats = (): QuizStats[] => {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading quiz stats:', error);
    return [];
  }
};

export const addQuizStats = (newStats: QuizStats): void => {
  const existingStats = loadQuizStats();
  const updatedStats = [...existingStats, { ...newStats, timestamp: Date.now() }];
  
  // Keep only last 50 quiz results
  if (updatedStats.length > 50) {
    updatedStats.splice(0, updatedStats.length - 50);
  }
  
  saveQuizStats(updatedStats);
};
