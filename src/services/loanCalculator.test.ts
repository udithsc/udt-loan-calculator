import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEMI,
  calculateLoan,
  compareLoanRepaymentTypes,
  getNextPaymentSummary,
} from './loanCalculator';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { LoanInputs } from '../types/loan';

const baseInputs: LoanInputs = {
  loanAmount: 100000,
  durationYears: 1,
  durationMonths: 12,
  interestRate: 12,
  repaymentType: 'equated',
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  currency: DEFAULT_CURRENCY,
};

test('calculateEMI returns the expected monthly payment', () => {
  assert.equal(calculateEMI(100000, 12, 12), 8884.88);
});

test('calculateLoan builds a balanced equated amortization schedule', () => {
  const result = calculateLoan(baseInputs);
  const totalPrincipal = result.amortizationSchedule.reduce(
    (sum, entry) => sum + entry.principal,
    0,
  );
  const totalPayments = result.amortizationSchedule.reduce((sum, entry) => sum + entry.payment, 0);

  assert.equal(result.monthlyPayment, 8884.88);
  assert.equal(result.amortizationSchedule.length, 12);
  assert.equal(result.amortizationSchedule.at(-1)?.balance, 0);
  assert.equal(Number(totalPrincipal.toFixed(2)), 100000);
  assert.equal(Number(totalPayments.toFixed(2)), result.totalAmountPayable);
  assert.equal(result.totalInterestPaid, 6618.53);
  assert.equal(result.finalPayment, 8884.85);
});

test('zero-interest loans split principal evenly with no interest', () => {
  const result = calculateLoan({
    ...baseInputs,
    loanAmount: 12000,
    interestRate: 0,
  });

  assert.equal(result.monthlyPayment, 1000);
  assert.equal(result.totalInterestPaid, 0);
  assert.equal(result.totalAmountPayable, 12000);
  assert.equal(
    result.amortizationSchedule.every((entry) => entry.interest === 0),
    true,
  );
});

test('reducing-balance loan keeps principal constant and payments decline', () => {
  const result = calculateLoan({
    ...baseInputs,
    repaymentType: 'reducing',
  });

  assert.equal(result.monthlyPayment, 9333.33);
  assert.equal(result.finalPayment, 8416.7);
  assert.equal(result.totalInterestPaid, 6500);
  assert.equal(result.totalAmountPayable, 106500);
  assert.equal(
    result.amortizationSchedule[0].payment > result.amortizationSchedule[11].payment,
    true,
  );
  assert.equal(result.amortizationSchedule.at(-1)?.balance, 0);
});

test('comparison reports reducing-balance interest savings', () => {
  const comparison = compareLoanRepaymentTypes(baseInputs);

  assert.equal(comparison.equated.totalInterestPaid, 6618.53);
  assert.equal(comparison.reducing.totalInterestPaid, 6500);
  assert.equal(comparison.interestSavingsWithReducing, 118.53);
  assert.equal(comparison.totalPayableDifference, 118.53);
});

test('extra monthly payments shorten the schedule and reduce interest', () => {
  const standard = calculateLoan(baseInputs);
  const accelerated = calculateLoan({
    ...baseInputs,
    extraMonthlyPayment: 5000,
  });

  assert.equal(
    accelerated.amortizationSchedule.length < standard.amortizationSchedule.length,
    true,
  );
  assert.equal(accelerated.totalInterestPaid < standard.totalInterestPaid, true);
  assert.equal(accelerated.amortizationSchedule.at(-1)?.balance, 0);
});

test('getNextPaymentSummary returns due payment and progress', () => {
  const result = calculateLoan(baseInputs);
  const next = getNextPaymentSummary(result, new Date('2026-03-15T00:00:00.000Z'));

  assert.equal(next?.month, 4);
  assert.equal(next?.payment, 8884.88);
  assert.equal(next?.paidPayments, 3);
  assert.equal(next?.remainingPayments, 9);
  assert.equal(next?.progress, 25);
  assert.equal(getNextPaymentSummary(result, new Date('2027-01-01T00:00:00.000Z')), null);
});

test('invalid inputs return an empty zero-value result', () => {
  const result = calculateLoan({
    ...baseInputs,
    loanAmount: 0,
  });

  assert.deepEqual(result.amortizationSchedule, []);
  assert.equal(result.monthlyPayment, 0);
  assert.equal(result.totalAmountPayable, 0);
});
