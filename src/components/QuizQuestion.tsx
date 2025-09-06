import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question } from '@/types/quiz';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswers: string[];
  onAnswerSelect: (answers: string[]) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  mode: 'practice' | 'exam';
  timeRemaining?: number;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswers,
  onAnswerSelect,
  showResult,
  isCorrect,
  mode,
  timeRemaining
}) => {
  const progress = (questionNumber / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionVariant = (option: string) => {
    if (!showResult) {
      return selectedAnswers.includes(option) ? 'default' : 'quiz';
    }

    if (question.correctAnswers.includes(option)) {
      return 'quiz-correct';
    }
    
    if (selectedAnswers.includes(option) && !question.correctAnswers.includes(option)) {
      return 'quiz-incorrect';
    }

    return 'quiz';
  };

  const handleOptionClick = (option: string) => {
    if (showResult) return;
    
    const newAnswers = selectedAnswers.includes(option)
      ? selectedAnswers.filter(ans => ans !== option)
      : [...selectedAnswers, option];
    
    onAnswerSelect(newAnswers);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress and Timer */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Pregunta {questionNumber} de {totalQuestions}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% completado
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {timeRemaining !== undefined && (
          <div className="ml-6 flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Question Card */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="mb-4 text-sm text-muted-foreground">
            {question.correctAnswers.length > 1 ? 
              `Selecciona ${question.correctAnswers.length} opciones correctas:` : 
              'Selecciona la opción correcta:'
            }
          </div>
          {question.allOptions.map((option, index) => (
            <Button
              key={index}
              variant={getOptionVariant(option) as any}
              className="w-full h-auto p-4 text-left justify-start whitespace-normal text-wrap"
              onClick={() => handleOptionClick(option)}
              disabled={showResult}
            >
              <div className="flex items-start gap-3 w-full">
                <span className="flex-shrink-0 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                
                {showResult && question.correctAnswers.includes(option) && (
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                )}
                
                {showResult && selectedAnswers.includes(option) && !question.correctAnswers.includes(option) && (
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Feedback for Practice Mode */}
      {showResult && mode === 'practice' && (
        <Card className={`border-2 ${isCorrect ? 'border-success bg-success-light/50' : 'border-destructive bg-destructive-light/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive" />
              )}
              <div>
                <p className="font-semibold">
                  {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                </p>
                {!isCorrect && (
                  <p className="text-sm opacity-90">
                    {question.correctAnswers.length > 1 ? 'Las respuestas correctas son: ' : 'La respuesta correcta es: '}
                    <strong>{question.correctAnswers.join(', ')}</strong>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};