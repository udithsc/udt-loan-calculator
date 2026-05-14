export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export type RepaymentType = 'equated' | 'reducing';

export interface LoanInputs {
  loanAmount: number;
  durationYears: number;
  durationMonths: number;
  interestRate: number; // Yearly percentage
  repaymentType: RepaymentType;
  startDate: Date;
  currency: Currency;
  extraMonthlyPayment?: number;
}

export interface AmortizationEntry {
  month: number;
  date: Date;
  interest: number;
  principal: number;
  balance: number;
  payment: number;
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  finalPayment: number;
  averagePayment: number;
  totalInterestPaid: number;
  totalAmountPayable: number;
  payOffDate: Date;
  amortizationSchedule: AmortizationEntry[];
}

export interface LoanResults extends LoanInputs, LoanCalculationResult {}

export interface LoanComparison {
  equated: LoanCalculationResult;
  reducing: LoanCalculationResult;
  interestSavingsWithReducing: number;
  totalPayableDifference: number;
}

export interface NextPaymentSummary {
  month: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  balanceAfterPayment: number;
  remainingPayments: number;
  paidPayments: number;
  totalPayments: number;
  progress: number;
}

export type LoanType = 'personal' | 'mortgage' | 'auto' | 'business';

// Helper type for loan type configuration
export interface LoanTypeConfig {
  type: LoanType;
  title: string;
  description: string;
  enabled: boolean;
  defaultInterestRate?: number;
  maxDurationMonths?: number;
}

// Default configurations for different loan types
export const LOAN_TYPE_CONFIGS: LoanTypeConfig[] = [
  {
    type: 'personal',
    title: 'Personal Loans',
    description: 'Calculate your personal loan payments',
    enabled: true,
    defaultInterestRate: 12,
    maxDurationMonths: 84,
  },
  {
    type: 'mortgage',
    title: 'Mortgages',
    description: 'Home loan calculations',
    enabled: true,
    defaultInterestRate: 7,
    maxDurationMonths: 360,
  },
  {
    type: 'auto',
    title: 'Auto Loans',
    description: 'Vehicle financing calculator',
    enabled: true,
    defaultInterestRate: 9,
    maxDurationMonths: 84,
  },
  {
    type: 'business',
    title: 'Business Loans',
    description: 'Business financing options',
    enabled: true,
    defaultInterestRate: 14,
    maxDurationMonths: 120,
  },
];
