import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDuration,
  validateExtraPayment,
  validateInterestRate,
  validateLoanAmount,
  validateLoanInputs,
} from './validators';

test('validateLoanAmount accepts configured loan amount range', () => {
  assert.equal(validateLoanAmount(1000), null);
  assert.equal(validateLoanAmount(100000000), null);
});

test('validateLoanAmount rejects invalid amounts', () => {
  assert.equal(validateLoanAmount(0), 'Please enter a valid loan amount');
  assert.equal(validateLoanAmount(999), 'Minimum loan amount is 1,000');
  assert.equal(validateLoanAmount(100000001), 'Maximum loan amount is 100,000,000');
});

test('validateDuration accepts whole months only', () => {
  assert.equal(validateDuration(1), null);
  assert.equal(validateDuration(600), null);
  assert.equal(validateDuration(0), 'Please enter a valid duration');
  assert.equal(validateDuration(1.5), 'Duration must be a whole number');
  assert.equal(validateDuration(601), 'Maximum duration is 50 years (600 months)');
});

test('validateInterestRate accepts zero and rejects invalid rates', () => {
  assert.equal(validateInterestRate(0), null);
  assert.equal(validateInterestRate(12.5), null);
  assert.equal(validateInterestRate(-1), 'Interest rate cannot be negative');
  assert.equal(validateInterestRate(101), 'Maximum interest rate is 100%');
});

test('validateExtraPayment accepts empty values and rejects negative payments', () => {
  assert.equal(validateExtraPayment(Number.NaN), null);
  assert.equal(validateExtraPayment(0), null);
  assert.equal(validateExtraPayment(250), null);
  assert.equal(validateExtraPayment(-1), 'Extra payment cannot be negative');
});

test('validateLoanInputs returns the first validation error', () => {
  assert.equal(validateLoanInputs(500, 0, -1), 'Minimum loan amount is 1,000');
  assert.equal(validateLoanInputs(1000, 0, -1), 'Please enter a valid duration');
  assert.equal(validateLoanInputs(1000, 12, -1), 'Interest rate cannot be negative');
  assert.equal(validateLoanInputs(1000, 12, 5, -1), 'Extra payment cannot be negative');
  assert.equal(validateLoanInputs(1000, 12, 5), null);
});
