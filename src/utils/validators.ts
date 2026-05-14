import { CONFIG } from '../constants/config';

export const validateLoanAmount = (amount: number): string | null => {
  if (isNaN(amount) || amount <= 0) {
    return 'Please enter a valid loan amount';
  }
  if (amount < CONFIG.MIN_LOAN_AMOUNT) {
    return `Minimum loan amount is ${CONFIG.MIN_LOAN_AMOUNT.toLocaleString()}`;
  }
  if (amount > CONFIG.MAX_LOAN_AMOUNT) {
    return `Maximum loan amount is ${CONFIG.MAX_LOAN_AMOUNT.toLocaleString()}`;
  }
  return null;
};

export const validateDuration = (months: number): string | null => {
  if (isNaN(months) || months <= 0) {
    return 'Please enter a valid duration';
  }
  if (months < CONFIG.MIN_DURATION_MONTHS) {
    return `Minimum duration is ${CONFIG.MIN_DURATION_MONTHS} month`;
  }
  if (months > CONFIG.MAX_DURATION_MONTHS) {
    const years = CONFIG.MAX_DURATION_MONTHS / 12;
    return `Maximum duration is ${years} years (${CONFIG.MAX_DURATION_MONTHS} months)`;
  }
  if (Math.floor(months) !== months) {
    return 'Duration must be a whole number';
  }
  return null;
};

export const validateInterestRate = (rate: number): string | null => {
  if (isNaN(rate)) {
    return 'Please enter a valid interest rate';
  }
  if (rate < 0) {
    return 'Interest rate cannot be negative';
  }
  if (rate > CONFIG.MAX_INTEREST_RATE) {
    return `Maximum interest rate is ${CONFIG.MAX_INTEREST_RATE}%`;
  }
  return null;
};

export const validateExtraPayment = (amount: number): string | null => {
  if (isNaN(amount)) {
    return null;
  }
  if (amount < 0) {
    return 'Extra payment cannot be negative';
  }
  return null;
};

export const validateLoanInputs = (
  amount: number,
  duration: number,
  interestRate: number,
  extraPayment: number = 0,
): string | null => {
  const amountError = validateLoanAmount(amount);
  if (amountError) return amountError;

  const durationError = validateDuration(duration);
  if (durationError) return durationError;

  const rateError = validateInterestRate(interestRate);
  if (rateError) return rateError;

  const extraPaymentError = validateExtraPayment(extraPayment);
  if (extraPaymentError) return extraPaymentError;

  return null;
};
