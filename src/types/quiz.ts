export interface Question {
  id: string;
  question: string;
  correctAnswers: string[];
  incorrectAnswers: string[];
  allOptions: string[];
}

export interface QuizSession {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
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
    correctAnswers: string[];
    userAnswers: string[];
  }>;
  score: number;
}

export interface QuizProgress {
  sessionId: string;
  session: QuizSession;
  lastUpdated: number;
}