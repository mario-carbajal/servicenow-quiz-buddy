export interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allOptions: string[];
}

export interface QuizSession {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  mode: 'practice' | 'exam';
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
}

export interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  incorrectQuestions: Array<{
    question: string;
    correctAnswer: string;
    userAnswer: string;
  }>;
  score: number;
}

export interface QuizProgress {
  sessionId: string;
  session: QuizSession;
  lastUpdated: number;
}