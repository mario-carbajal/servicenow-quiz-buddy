import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Brain, FileText, Trophy, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { QuizQuestion } from '@/components/QuizQuestion';
import { QuizStats } from '@/components/QuizStats';
import { Question, QuizSession, QuizStats as QuizStatsType } from '@/types/quiz';
import { saveQuizProgress, loadQuizProgress, clearQuizProgress, addQuizStats } from '@/utils/quizStorage';

type AppState = 'home' | 'upload' | 'mode-select' | 'quiz' | 'results';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizStats, setQuizStats] = useState<QuizStatsType | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = loadQuizProgress();
    if (savedProgress && !savedProgress.session.isCompleted) {
      setQuestions(savedProgress.session.questions);
      setQuizSession(savedProgress.session);
      setAppState('quiz');
    }
  }, []);

  // Timer for exam mode
  useEffect(() => {
    if (quizSession?.mode === 'exam' && appState === 'quiz' && !quizSession.isCompleted) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev ? prev - 1 : undefined;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [quizSession, appState]);

  const handleQuestionsLoaded = useCallback((loadedQuestions: Question[]) => {
    setQuestions(loadedQuestions);
    setAppState('mode-select');
  }, []);

  const startQuiz = useCallback((mode: 'practice' | 'exam') => {
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    const session: QuizSession = {
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      answers: {},
      mode,
      startTime: Date.now(),
      isCompleted: false
    };

    setQuizSession(session);
    setCurrentAnswer(null);
    setShowResult(false);
    setAppState('quiz');

    // Set timer for exam mode (assume 2 minutes per question)
    if (mode === 'exam') {
      setTimeRemaining(shuffledQuestions.length * 120);
    }

    // Save progress
    saveQuizProgress({
      sessionId: `session_${Date.now()}`,
      session,
      lastUpdated: Date.now()
    });
  }, [questions]);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (!quizSession) return;

    setCurrentAnswer(answer);
    
    if (quizSession.mode === 'practice') {
      setShowResult(true);
      // Auto-advance after 2 seconds in practice mode
      setTimeout(() => {
        handleNextQuestion(answer);
      }, 2000);
    }
  }, [quizSession]);

  const handleNextQuestion = useCallback((answer?: string) => {
    if (!quizSession) return;

    const answerToSave = answer || currentAnswer;
    if (!answerToSave) return;

    const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
    const updatedAnswers = {
      ...quizSession.answers,
      [currentQuestion.id]: answerToSave
    };

    const isLastQuestion = quizSession.currentQuestionIndex >= quizSession.questions.length - 1;

    if (isLastQuestion) {
      handleQuizComplete(updatedAnswers);
    } else {
      const updatedSession: QuizSession = {
        ...quizSession,
        currentQuestionIndex: quizSession.currentQuestionIndex + 1,
        answers: updatedAnswers
      };

      setQuizSession(updatedSession);
      setCurrentAnswer(null);
      setShowResult(false);

      // Save progress
      saveQuizProgress({
        sessionId: `session_${Date.now()}`,
        session: updatedSession,
        lastUpdated: Date.now()
      });
    }
  }, [quizSession, currentAnswer]);

  const handleQuizComplete = useCallback((finalAnswers?: Record<string, string>) => {
    if (!quizSession) return;

    const answers = finalAnswers || quizSession.answers;
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - quizSession.startTime) / 1000);

    let correctCount = 0;
    const incorrectQuestions: QuizStatsType['incorrectQuestions'] = [];

    quizSession.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
      } else if (userAnswer) {
        incorrectQuestions.push({
          question: question.question,
          correctAnswer: question.correctAnswer,
          userAnswer
        });
      }
    });

    const stats: QuizStatsType = {
      totalQuestions: quizSession.questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: quizSession.questions.length - correctCount,
      timeSpent,
      incorrectQuestions,
      score: Math.round((correctCount / quizSession.questions.length) * 100)
    };

    setQuizStats(stats);
    setAppState('results');
    
    // Save stats and clear progress
    addQuizStats(stats);
    clearQuizProgress();
  }, [quizSession]);

  const handleRestart = useCallback(() => {
    if (quizSession) {
      startQuiz(quizSession.mode);
    }
  }, [quizSession, startQuiz]);

  const handleNewQuiz = useCallback(() => {
    setAppState('home');
    setQuestions([]);
    setQuizSession(null);
    setQuizStats(null);
    setCurrentAnswer(null);
    setShowResult(false);
    setTimeRemaining(undefined);
    clearQuizProgress();
  }, []);

  const currentQuestion = quizSession?.questions[quizSession.currentQuestionIndex];
  const isCorrect = currentAnswer === currentQuestion?.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Home Screen */}
        {appState === 'home' && (
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">ServiceNow Certification</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Quiz de Estudio
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Prepárate para tu certificación de ServiceNow con nuestro sistema de preguntas interactivo
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setAppState('upload')}>
                <CardHeader className="pb-4">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle>Subir Preguntas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Carga tu archivo Excel con preguntas y respuestas para comenzar el estudio
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                  <CardTitle>Características</CardTitle>
                </CardHeader>
                <CardContent className="text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-success" />
                    <span className="text-sm">Modo Práctica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm">Modo Examen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Estadísticas detalladas</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* File Upload Screen */}
        {appState === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <Button variant="ghost" onClick={() => setAppState('home')} className="mb-4">
                ← Volver al inicio
              </Button>
              <h2 className="text-3xl font-bold mb-2">Cargar Archivo de Preguntas</h2>
              <p className="text-muted-foreground">
                Sube tu archivo Excel o CSV con las preguntas para tu examen de certificación
              </p>
            </div>
            
            <FileUpload
              onQuestionsLoaded={handleQuestionsLoaded}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        )}

        {/* Mode Selection Screen */}
        {appState === 'mode-select' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <Button variant="ghost" onClick={() => setAppState('upload')} className="mb-4">
                ← Cambiar archivo
              </Button>
              <h2 className="text-3xl font-bold mb-2">Selecciona el Modo de Estudio</h2>
              <p className="text-muted-foreground mb-4">
                Se cargaron {questions.length} preguntas correctamente
              </p>
              <Badge variant="secondary" className="mb-6">
                <FileText className="w-4 h-4 mr-1" />
                {questions.length} preguntas listas
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => startQuiz('practice')}>
                <CardHeader>
                  <Brain className="w-8 h-8 text-success mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-success">Modo Práctica</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Feedback inmediato después de cada pregunta. Ideal para aprender.
                  </p>
                  <Button variant="success" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Práctica
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => startQuiz('exam')}>
                <CardHeader>
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-primary">Modo Examen</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Resultados al final. Simula un examen real con tiempo limitado.
                  </p>
                  <Button variant="hero" className="w-full">
                    <Trophy className="w-4 h-4 mr-2" />
                    Iniciar Examen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quiz Screen */}
        {appState === 'quiz' && quizSession && currentQuestion && (
          <div className="space-y-6">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                <Brain className="w-4 h-4 mr-1" />
                Modo {quizSession.mode === 'practice' ? 'Práctica' : 'Examen'}
              </Badge>
            </div>

            <QuizQuestion
              question={currentQuestion}
              questionNumber={quizSession.currentQuestionIndex + 1}
              totalQuestions={quizSession.questions.length}
              selectedAnswer={currentAnswer}
              onAnswerSelect={handleAnswerSelect}
              showResult={showResult}
              isCorrect={isCorrect}
              mode={quizSession.mode}
              timeRemaining={timeRemaining}
            />

            {/* Next Button for Exam Mode */}
            {quizSession.mode === 'exam' && currentAnswer && !showResult && (
              <div className="text-center">
                <Button onClick={() => handleNextQuestion()} variant="hero" size="lg">
                  {quizSession.currentQuestionIndex < quizSession.questions.length - 1 
                    ? 'Siguiente Pregunta' 
                    : 'Finalizar Examen'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results Screen */}
        {appState === 'results' && quizStats && (
          <div className="space-y-6">
            <QuizStats
              stats={quizStats}
              onRestart={handleRestart}
              onNewQuiz={handleNewQuiz}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
