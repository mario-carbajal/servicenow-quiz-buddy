import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseExcelFile, validateFileType } from '@/utils/excelParser';
import { Question } from '@/types/quiz';

interface FileUploadProps {
  onQuestionsLoaded: (questions: Question[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onQuestionsLoaded,
  isLoading,
  setIsLoading
}) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);

    if (!validateFileType(file)) {
      setError('Tipo de archivo no válido. Sube un archivo .xlsx, .xls o .csv');
      setIsLoading(false);
      return;
    }

    try {
      const questions = await parseExcelFile(file);
      onQuestionsLoaded(questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setIsLoading(false);
    }
  }, [onQuestionsLoaded, setIsLoading]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div
            className={`text-center ${dragActive ? 'bg-primary/5' : ''} rounded-lg p-6 transition-colors`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              {isLoading ? (
                <div className="animate-spin mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
              ) : (
                <Upload className="mx-auto w-12 h-12 text-muted-foreground" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isLoading ? 'Procesando archivo...' : 'Sube tu archivo de preguntas'}
            </h3>
            
            <p className="text-muted-foreground mb-4">
              Arrastra y suelta tu archivo Excel (.xlsx, .xls) o CSV aquí
            </p>
            
            <Button
              variant="hero"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="mb-4"
            >
              <FileText className="w-4 h-4 mr-2" />
              Seleccionar archivo
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleInputChange}
              className="hidden"
            />
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Formato esperado:</p>
              <ul className="text-left space-y-1">
                <li>• Columna A: Pregunta</li>
                <li>• Columna B: Respuesta correcta</li>
                <li>• Columnas C, D, E: Opciones incorrectas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mt-4 border-destructive/50 bg-destructive-light">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive-foreground">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};