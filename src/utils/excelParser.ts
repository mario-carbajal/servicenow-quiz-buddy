import * as XLSX from 'xlsx';
import { Question } from '@/types/quiz';

export const parseExcelFile = (file: File): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with headers from first row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const questions: Question[] = [];
        
        // Skip header row (if any) and process data
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          // Skip empty rows
          if (!row || row.length < 5 || !row[0]) continue;
          
          const question = row[0]?.toString().trim();
          const correctAnswer = row[1]?.toString().trim();
          const incorrectAnswer1 = row[2]?.toString().trim();
          const incorrectAnswer2 = row[3]?.toString().trim();
          const incorrectAnswer3 = row[4]?.toString().trim();
          
          if (question && correctAnswer && incorrectAnswer1 && incorrectAnswer2 && incorrectAnswer3) {
            const incorrectAnswers = [incorrectAnswer1, incorrectAnswer2, incorrectAnswer3];
            const allOptions = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
            
            questions.push({
              id: `q_${i}_${Date.now()}`,
              question,
              correctAnswer,
              incorrectAnswers,
              allOptions
            });
          }
        }
        
        if (questions.length === 0) {
          reject(new Error('No se encontraron preguntas válidas en el archivo. Verifica el formato.'));
          return;
        }
        
        resolve(questions);
      } catch (error) {
        reject(new Error('Error al procesar el archivo. Verifica que sea un archivo Excel válido.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const validateFileType = (file: File): boolean => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];
  
  return validTypes.includes(file.type) || 
         file.name.endsWith('.xlsx') || 
         file.name.endsWith('.xls') || 
         file.name.endsWith('.csv');
};