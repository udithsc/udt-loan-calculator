import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercentage,
} from './formatters';
import { DEFAULT_CURRENCY } from '../constants/currencies';

test('formatNumber and currency helpers render stable financial values', () => {
  assert.equal(formatNumber(1234.567), '1,234.57');
  assert.equal(formatCurrency(1234.5, DEFAULT_CURRENCY), '$1,234.50');
  assert.equal(formatPercentage(7.125, 2), '7.13%');
});

test('formatDuration pluralizes years and months correctly', () => {
  assert.equal(formatDuration(1), '1 month');
  assert.equal(formatDuration(12), '1 year');
  assert.equal(formatDuration(26), '2 years 2 months');
});

test('formatDate handles valid and invalid dates', () => {
  assert.equal(formatDate(new Date('2026-01-15T00:00:00.000Z')), 'Jan 15, 2026');
  assert.equal(formatDate(new Date('invalid')), 'Invalid Date');
});

test('formatCompactCurrency abbreviates large amounts', () => {
  assert.equal(formatCompactCurrency(950, DEFAULT_CURRENCY), '$950.00');
  assert.equal(formatCompactCurrency(12500, DEFAULT_CURRENCY), '$12.5K');
  assert.equal(formatCompactCurrency(2500000, DEFAULT_CURRENCY), '$2.5M');
});
