import { LoanResults } from '../types/loan';
import { formatDate } from '../utils/formatters';

const csvValue = (value: string | number): string => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const buildAmortizationCsv = (results: LoanResults): string => {
  const rows = [
    ['Month', 'Date', 'Payment', 'Interest', 'Principal', 'Balance'],
    ...results.amortizationSchedule.map((entry) => [
      entry.month,
      formatDate(entry.date),
      entry.payment.toFixed(2),
      entry.interest.toFixed(2),
      entry.principal.toFixed(2),
      entry.balance.toFixed(2),
    ]),
  ];

  return rows.map((row) => row.map(csvValue).join(',')).join('\n');
};
