import { addMonths } from 'date-fns';
import {
  LoanInputs,
  LoanCalculationResult,
  AmortizationEntry,
  RepaymentType,
} from '../types/loan';

/**
 * Calculate EMI (Equated Monthly Installment)
 */
export const calculateEMI = (
  principal: number,
  annualRate: number,
  months: number
): number => {
  if (principal <= 0 || months <= 0) {
    return 0;
  }

  if (annualRate === 0) {
    // If no interest, just divide principal by months
    return principal / months;
  }

  const monthlyRate = annualRate / 12 / 100;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;

  return numerator / denominator;
};

/**
 * Calculate reducing balance payment for a specific month.
 * Principal payment remains constant, interest decreases over time.
 */
const calculateReducingBalancePayment = (
  principal: number,
  remainingBalance: number,
  annualRate: number,
  months: number
): { payment: number; interest: number; principalPayment: number } => {
  const monthlyRate = annualRate / 12 / 100;
  const constantPrincipal = principal / months;
  const interest = remainingBalance * monthlyRate;
  const payment = constantPrincipal + interest;

  return {
    payment,
    interest,
    principalPayment: constantPrincipal,
  };
};

/**
 * Generate amortization schedule for Equated Monthly Installment
 */
const generateEquatedAmortizationSchedule = (
  principal: number,
  monthlyPayment: number,
  annualRate: number,
  months: number,
  startDate: Date
): AmortizationEntry[] => {
  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let month = 1; month <= months; month++) {
    const interestPayment = annualRate === 0 ? 0 : balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    // Use date-fns for reliable date calculation
    const paymentDate = addMonths(startDate, month - 1);

    schedule.push({
      month,
      date: paymentDate,
      interest: interestPayment,
      principal: principalPayment,
      balance: balance,
      payment: monthlyPayment,
    });
  }

  return schedule;
};

/**
 * Generate amortization schedule for Reducing Balance
 * Principal payment is constant, interest decreases over time
 */
const generateReducingBalanceAmortizationSchedule = (
  principal: number,
  annualRate: number,
  months: number,
  startDate: Date
): AmortizationEntry[] => {
  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  const constantPrincipal = principal / months;

  for (let month = 1; month <= months; month++) {
    const { payment, interest, principalPayment } = calculateReducingBalancePayment(
      principal,
      balance,
      annualRate,
      months
    );

    balance = Math.max(0, balance - principalPayment);

    // Use date-fns for reliable date calculation
    const paymentDate = addMonths(startDate, month - 1);

    schedule.push({
      month,
      date: paymentDate,
      interest,
      principal: principalPayment,
      balance: balance,
      payment,
    });
  }

  return schedule;
};

/**
 * Calculate complete loan details
 */
export const calculateLoan = (inputs: LoanInputs): LoanCalculationResult => {
  const { loanAmount, durationMonths, interestRate, repaymentType, startDate } = inputs;

  let amortizationSchedule: AmortizationEntry[];
  let monthlyPayment: number;

  if (repaymentType === 'reducing') {
    // Reducing balance method
    amortizationSchedule = generateReducingBalanceAmortizationSchedule(
      loanAmount,
      interestRate,
      durationMonths,
      startDate
    );
    // For reducing balance, first month payment is the highest
    monthlyPayment = amortizationSchedule[0]?.payment || 0;
  } else {
    // Equated balance method (EMI)
    monthlyPayment = calculateEMI(loanAmount, interestRate, durationMonths);
    amortizationSchedule = generateEquatedAmortizationSchedule(
      loanAmount,
      monthlyPayment,
      interestRate,
      durationMonths,
      startDate
    );
  }

  const totalInterestPaid = amortizationSchedule.reduce(
    (sum, entry) => sum + entry.interest,
    0
  );

  const totalAmountPayable = loanAmount + totalInterestPaid;

  // Calculate pay-off date using date-fns
  const payOffDate = addMonths(startDate, durationMonths);

  return {
    monthlyPayment,
    totalInterestPaid,
    totalAmountPayable,
    payOffDate,
    amortizationSchedule,
  };
};

/**
 * Compare two loans
 */
export const compareLoanRepaymentTypes = (
  inputs: LoanInputs
): { equated: LoanCalculationResult; reducing: LoanCalculationResult } => {
  const equatedInputs = { ...inputs, repaymentType: 'equated' as RepaymentType };
  const reducingInputs = { ...inputs, repaymentType: 'reducing' as RepaymentType };

  return {
    equated: calculateLoan(equatedInputs),
    reducing: calculateLoan(reducingInputs),
  };
};
