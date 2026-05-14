import { addMonths } from 'date-fns';
import {
  LoanInputs,
  LoanCalculationResult,
  AmortizationEntry,
  RepaymentType,
  LoanComparison,
  NextPaymentSummary,
} from '../types/loan';

const roundMoney = (amount: number): number => Number(amount.toFixed(2));

const sumSchedulePayments = (schedule: AmortizationEntry[]): number =>
  roundMoney(schedule.reduce((sum, entry) => sum + entry.payment, 0));

const sumScheduleInterest = (schedule: AmortizationEntry[]): number =>
  roundMoney(schedule.reduce((sum, entry) => sum + entry.interest, 0));

/**
 * Calculate EMI (Equated Monthly Installment)
 */
export const calculateEMI = (principal: number, annualRate: number, months: number): number => {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    principal <= 0 ||
    months <= 0
  ) {
    return 0;
  }

  if (annualRate === 0) {
    // If no interest, just divide principal by months
    return principal / months;
  }

  const monthlyRate = annualRate / 12 / 100;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;

  return roundMoney(numerator / denominator);
};

/**
 * Calculate reducing balance payment for a specific month.
 * Principal payment remains constant, interest decreases over time.
 */
const calculateReducingBalancePayment = (
  principal: number,
  remainingBalance: number,
  annualRate: number,
  months: number,
): { payment: number; interest: number; principalPayment: number } => {
  const monthlyRate = annualRate / 12 / 100;
  const constantPrincipal = principal / months;
  const interest = remainingBalance * monthlyRate;
  const payment = constantPrincipal + interest;

  return {
    payment: roundMoney(payment),
    interest: roundMoney(interest),
    principalPayment: roundMoney(constantPrincipal),
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
  startDate: Date,
  extraMonthlyPayment: number,
): AmortizationEntry[] => {
  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let month = 1; month <= months && balance > 0; month++) {
    const interestPayment = roundMoney(annualRate === 0 ? 0 : balance * monthlyRate);
    let payment = roundMoney(monthlyPayment + extraMonthlyPayment);
    let principalPayment = roundMoney(payment - interestPayment);

    if (month === months || principalPayment >= balance) {
      principalPayment = roundMoney(balance);
      payment = roundMoney(principalPayment + interestPayment);
    }

    balance = roundMoney(Math.max(0, balance - principalPayment));

    // Use date-fns for reliable date calculation
    const paymentDate = addMonths(startDate, month - 1);

    schedule.push({
      month,
      date: paymentDate,
      interest: interestPayment,
      principal: principalPayment,
      balance: balance,
      payment,
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
  startDate: Date,
  extraMonthlyPayment: number,
): AmortizationEntry[] => {
  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  for (let month = 1; month <= months && balance > 0; month++) {
    const calculated = calculateReducingBalancePayment(principal, balance, annualRate, months);

    const scheduledPrincipal = roundMoney(calculated.principalPayment + extraMonthlyPayment);
    const principalPayment =
      month === months || scheduledPrincipal >= balance ? roundMoney(balance) : scheduledPrincipal;
    const interest = calculated.interest;
    const payment = roundMoney(principalPayment + interest);

    balance = roundMoney(Math.max(0, balance - principalPayment));

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
  const {
    loanAmount,
    durationMonths,
    interestRate,
    repaymentType,
    startDate,
    extraMonthlyPayment = 0,
  } = inputs;

  if (
    !Number.isFinite(loanAmount) ||
    !Number.isFinite(durationMonths) ||
    !Number.isFinite(interestRate) ||
    !Number.isFinite(extraMonthlyPayment) ||
    loanAmount <= 0 ||
    durationMonths <= 0 ||
    extraMonthlyPayment < 0
  ) {
    return {
      monthlyPayment: 0,
      finalPayment: 0,
      averagePayment: 0,
      totalInterestPaid: 0,
      totalAmountPayable: 0,
      payOffDate: startDate,
      amortizationSchedule: [],
    };
  }

  let amortizationSchedule: AmortizationEntry[];
  let monthlyPayment: number;

  if (repaymentType === 'reducing') {
    // Reducing balance method
    amortizationSchedule = generateReducingBalanceAmortizationSchedule(
      loanAmount,
      interestRate,
      durationMonths,
      startDate,
      extraMonthlyPayment,
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
      startDate,
      extraMonthlyPayment,
    );
  }

  const totalInterestPaid = sumScheduleInterest(amortizationSchedule);
  const totalAmountPayable = sumSchedulePayments(amortizationSchedule);
  const finalPayment = amortizationSchedule[amortizationSchedule.length - 1]?.payment || 0;
  const averagePayment = amortizationSchedule.length
    ? roundMoney(totalAmountPayable / amortizationSchedule.length)
    : 0;

  const lastPaymentDate = amortizationSchedule[amortizationSchedule.length - 1]?.date;
  const payOffDate = lastPaymentDate || startDate;

  return {
    monthlyPayment,
    finalPayment,
    averagePayment,
    totalInterestPaid,
    totalAmountPayable,
    payOffDate,
    amortizationSchedule,
  };
};

/**
 * Compare two loans
 */
export const compareLoanRepaymentTypes = (inputs: LoanInputs): LoanComparison => {
  const equatedInputs = { ...inputs, repaymentType: 'equated' as RepaymentType };
  const reducingInputs = { ...inputs, repaymentType: 'reducing' as RepaymentType };
  const equated = calculateLoan(equatedInputs);
  const reducing = calculateLoan(reducingInputs);

  return {
    equated,
    reducing,
    interestSavingsWithReducing: roundMoney(equated.totalInterestPaid - reducing.totalInterestPaid),
    totalPayableDifference: roundMoney(equated.totalAmountPayable - reducing.totalAmountPayable),
  };
};

export const getNextPaymentSummary = (
  result: LoanCalculationResult,
  asOf: Date = new Date(),
): NextPaymentSummary | null => {
  if (!result.amortizationSchedule.length) {
    return null;
  }

  const resolvedIndex = result.amortizationSchedule.findIndex((entry) => entry.date >= asOf);
  if (resolvedIndex === -1) {
    return null;
  }
  const nextPayment = result.amortizationSchedule[resolvedIndex];
  const paidPayments = Math.max(0, resolvedIndex);
  const totalPayments = result.amortizationSchedule.length;

  return {
    month: nextPayment.month,
    date: nextPayment.date,
    payment: nextPayment.payment,
    principal: nextPayment.principal,
    interest: nextPayment.interest,
    balanceAfterPayment: nextPayment.balance,
    remainingPayments: Math.max(0, totalPayments - resolvedIndex),
    paidPayments,
    totalPayments,
    progress: totalPayments ? roundMoney((paidPayments / totalPayments) * 100) : 0,
  };
};
