import React from 'react';
import { CheckCircle, XCircle, Clock, Target, RotateCcw, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizStats as QuizStatsType } from '@/types/quiz';

interface QuizStatsProps {
  stats: QuizStatsType;
  onRestart: () => void;
  onNewQuiz: () => void;
}

export const QuizStats: React.FC<QuizStatsProps> = ({
  stats,
  onRestart,
  onNewQuiz
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-orange-500';
    return 'text-destructive';
  };

  const exportResults = () => {
    const csvContent = [
      ['Pregunta', 'Respuestas Correctas', 'Tus Respuestas'].join(','),
      ...stats.incorrectQuestions.map(q => 
        [q.question, q.correctAnswers.join('; '), q.userAnswers.join('; ')].map(field => 
          `"${field.replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overall Stats */}
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Resultados del Examen</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Circle */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(stats.score)}`}>
                  {stats.score}%
                </div>
                <div className="text-sm text-muted-foreground">Puntuación</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm text-muted-foreground">
                {stats.correctAnswers}/{stats.totalQuestions} correctas
              </span>
            </div>
            <Progress value={stats.score} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-success-light">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">{stats.correctAnswers}</div>
              <div className="text-sm text-success-foreground">Correctas</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-destructive-light">
              <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">{stats.incorrectAnswers}</div>
              <div className="text-sm text-destructive-foreground">Incorrectas</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold">{formatTime(stats.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Tiempo Total</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.totalQuestions}</div>
              <div className="text-sm text-primary-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incorrect Questions */}
      {stats.incorrectQuestions.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Preguntas Incorrectas ({stats.incorrectQuestions.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {stats.incorrectQuestions.map((item, index) => (
              <div key={index} className="p-4 rounded-lg border border-destructive/20 bg-destructive-light/30">
                <div className="font-medium mb-2">{item.question}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>{item.correctAnswers.length > 1 ? 'Correctas: ' : 'Correcto: '}
                      <strong>{item.correctAnswers.join(', ')}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span>{item.userAnswers.length > 1 ? 'Tus respuestas: ' : 'Tu respuesta: '}
                      <strong>{item.userAnswers.join(', ') || 'Sin respuesta'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRestart} variant="hero" size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Repetir Examen
        </Button>
        
        <Button onClick={onNewQuiz} variant="outline" size="lg">
          Nuevo Examen
        </Button>
        
        {stats.incorrectQuestions.length > 0 && (
          <Button onClick={exportResults} variant="secondary" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Exportar Errores
          </Button>
        )}
      </div>
    </div>
  );
};