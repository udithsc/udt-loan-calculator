import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAmortizationCsv } from './exportService';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { LoanResults } from '../types/loan';

test('buildAmortizationCsv exports stable schedule rows', () => {
  const results: LoanResults = {
    loanAmount: 1000,
    durationYears: 0,
    durationMonths: 2,
    interestRate: 0,
    repaymentType: 'equated',
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    currency: DEFAULT_CURRENCY,
    monthlyPayment: 500,
    finalPayment: 500,
    averagePayment: 500,
    totalInterestPaid: 0,
    totalAmountPayable: 1000,
    payOffDate: new Date('2026-02-01T00:00:00.000Z'),
    amortizationSchedule: [
      {
        month: 1,
        date: new Date('2026-01-01T00:00:00.000Z'),
        payment: 500,
        interest: 0,
        principal: 500,
        balance: 500,
      },
      {
        month: 2,
        date: new Date('2026-02-01T00:00:00.000Z'),
        payment: 500,
        interest: 0,
        principal: 500,
        balance: 0,
      },
    ],
  };

  assert.equal(
    buildAmortizationCsv(results),
    [
      'Month,Date,Payment,Interest,Principal,Balance',
      '1,"Jan 1, 2026",500.00,0.00,500.00,500.00',
      '2,"Feb 1, 2026",500.00,0.00,500.00,0.00',
    ].join('\n'),
  );
});
