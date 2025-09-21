import { useState } from 'react';
import { createWorker } from 'tesseract.js';
import type { Expense } from '../store/useExpensesStore';

type ReceiptUploadProps = {
  onDataExtracted: (data: Partial<Expense>) => void;
};

const ReceiptUpload = ({ onDataExtracted }: ReceiptUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');

  const handleFile = async (file?: File) => {
    if (!file) return;

    setIsLoading(true);
    setExtractedText('');

    const worker = await createWorker('eng');
    try {
      const imageUrl = URL.createObjectURL(file);
      const { data } = await worker.recognize(imageUrl);
      const text = data.text || '';
      setExtractedText(text);

      // Amount regex patterns:
      // 1) $12.34 -> /\$\s*([0-9]+(?:\.[0-9]{2})?)/
      // 2) Total: 45.67 (case-insensitive) -> /total[^0-9]*([0-9]+(?:\.[0-9]{2})?)/i
      let amount: number | undefined;
      const dollarMatch = text.match(/\$\s*([0-9]+(?:\.[0-9]{2})?)/);
      const totalMatch = text.match(/total[^0-9]*([0-9]+(?:\.[0-9]{2})?)/i);
      if (dollarMatch?.[1]) {
        amount = parseFloat(dollarMatch[1]);
      } else if (totalMatch?.[1]) {
        amount = parseFloat(totalMatch[1]);
      }

      // Date regex patterns:
      // 1) MM/DD/YYYY -> /(\b\d{1,2}\/\d{1,2}\/\d{4}\b)/
      // 2) YYYY-MM-DD -> /(\b\d{4}-\d{2}-\d{2}\b)/
      let date: string | undefined;
      const mdyy = text.match(/\b(\d{1,2}\/\d{1,2}\/\d{4})\b/);
      const ymd = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
      if (ymd?.[1]) {
        date = ymd[1];
      } else if (mdyy?.[1]) {
        const [m, d, y] = mdyy[1].split('/');
        const mm = m.padStart(2, '0');
        const dd = d.padStart(2, '0');
        date = `${y}-${mm}-${dd}`;
      }

      // Vendor/description: first non-empty line
      const firstNonEmpty = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => l.length > 0);
      const description = firstNonEmpty;

      onDataExtracted({ amount, date, description });
    } catch (e) {
      // Optional: handle error feedback
    } finally {
      await worker.terminate();
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="group inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-uofl-red to-uofl-red-light hover:from-uofl-red-dark hover:to-uofl-red text-white cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-medium">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="font-semibold">Upload Receipt</span>
      </label>

      {isLoading && (
        <div className="flex items-center space-x-3 p-4 bg-uofl-red/10 rounded-xl">
          <div className="w-5 h-5 border-2 border-uofl-red border-t-transparent rounded-full animate-spin"></div>
          <span className="text-uofl-red font-medium">Processing receipt...</span>
        </div>
      )}

      {extractedText && (
        <div className="bg-uofl-gray-50 rounded-xl p-4 border-2 border-uofl-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-uofl-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-uofl-gray-700">Text Extracted</span>
          </div>
          <pre className="text-xs text-uofl-gray-600 max-h-32 overflow-auto whitespace-pre-wrap bg-white p-3 rounded-lg border">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;
