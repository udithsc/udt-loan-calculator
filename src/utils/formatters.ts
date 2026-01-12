import { format, addMonths, isValid } from 'date-fns';
import { Currency } from '../types/loan';

export const formatCurrency = (amount: number, currency: Currency): string => {
  return `${currency.symbol}${formatNumber(amount, 2)}`;
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  if (isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercentage = (rate: number, decimals: number = 2): string => {
  return `${formatNumber(rate, decimals)}%`;
};

export const formatDate = (date: Date): string => {
  if (!isValid(date)) {
    return 'Invalid Date';
  }
  return format(date, 'MMM d, yyyy');
};

export const formatDateShort = (date: Date): string => {
  if (!isValid(date)) {
    return 'N/A';
  }
  return format(date, 'MMM yyyy');
};

export const formatDateLong = (date: Date): string => {
  if (!isValid(date)) {
    return 'Invalid Date';
  }
  return format(date, 'MMMM d, yyyy');
};

export const addMonthsToDate = (date: Date, months: number): Date => {
  return addMonths(date, months);
};

export const formatDuration = (totalMonths: number): string => {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else if (months === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  }
};

export const formatCompactCurrency = (amount: number, currency: Currency): string => {
  if (amount >= 1000000) {
    return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency);
};
