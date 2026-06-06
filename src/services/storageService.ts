import AsyncStorage from '@react-native-async-storage/async-storage';
import { AmortizationEntry, LoanInputs, LoanCalculationResult } from '../types/loan';
import { calculateLoan } from './loanCalculator';

const HISTORY_STORAGE_KEY = '@loan_calculator_history';
const MAX_HISTORY_ITEMS = 20;
const STORAGE_SCHEMA_VERSION = 2;

export interface SavedCalculation {
  id: string;
  inputs: LoanInputs;
  results: LoanCalculationResult;
  createdAt: string;
  name?: string;
}

type SerializedLoanInputs = Omit<LoanInputs, 'startDate'> & {
  startDate: string;
};

type SerializedAmortizationEntry = Omit<AmortizationEntry, 'date'> & {
  date: string;
};

type SerializedLoanCalculationResult = Omit<
  LoanCalculationResult,
  'payOffDate' | 'amortizationSchedule'
> & {
  payOffDate: string;
  amortizationSchedule: SerializedAmortizationEntry[];
};

type SerializedResultSummary = Pick<
  LoanCalculationResult,
  'monthlyPayment' | 'finalPayment' | 'averagePayment' | 'totalInterestPaid' | 'totalAmountPayable'
> & {
  payOffDate: string;
  paymentCount: number;
};

type LegacySerializedSavedCalculation = {
  id: string;
  inputs: SerializedLoanInputs;
  results: SerializedLoanCalculationResult;
  createdAt: string;
  name?: string;
};

type SerializedSavedCalculation = {
  schemaVersion: typeof STORAGE_SCHEMA_VERSION;
  id: string;
  inputs: SerializedLoanInputs;
  resultSummary: SerializedResultSummary;
  createdAt: string;
  name?: string;
};

const serializeInputs = (inputs: LoanInputs): SerializedLoanInputs => ({
  ...inputs,
  startDate: inputs.startDate.toISOString(),
});

const deserializeInputs = (inputs: SerializedLoanInputs): LoanInputs => ({
  ...inputs,
  startDate: new Date(inputs.startDate),
});

const summarizeResult = (results: LoanCalculationResult): SerializedResultSummary => ({
  monthlyPayment: results.monthlyPayment,
  finalPayment: results.finalPayment,
  averagePayment: results.averagePayment,
  totalInterestPaid: results.totalInterestPaid,
  totalAmountPayable: results.totalAmountPayable,
  payOffDate: results.payOffDate.toISOString(),
  paymentCount: results.amortizationSchedule.length,
});

const serializeSavedCalculation = (item: SavedCalculation): SerializedSavedCalculation => ({
  schemaVersion: STORAGE_SCHEMA_VERSION,
  id: item.id,
  inputs: serializeInputs(item.inputs),
  resultSummary: summarizeResult(item.results),
  createdAt: item.createdAt,
  name: item.name,
});

const isCurrentSerializedCalculation = (
  data: SerializedSavedCalculation | LegacySerializedSavedCalculation,
): data is SerializedSavedCalculation =>
  'schemaVersion' in data && data.schemaVersion === STORAGE_SCHEMA_VERSION;

// Deserialize legacy records that stored the full amortization schedule.
const deserializeLegacyCalculation = (data: LegacySerializedSavedCalculation): SavedCalculation => {
  return {
    id: data.id,
    createdAt: data.createdAt,
    name: data.name,
    inputs: {
      ...data.inputs,
      startDate: new Date(data.inputs.startDate),
    },
    results: {
      ...data.results,
      payOffDate: new Date(data.results.payOffDate),
      amortizationSchedule: data.results.amortizationSchedule.map((entry) => ({
        ...entry,
        date: new Date(entry.date),
      })),
    },
  };
};

// Deserialize current records and rebuild the full schedule from compact inputs.
const deserializeCalculation = (
  data: SerializedSavedCalculation | LegacySerializedSavedCalculation,
): SavedCalculation => {
  if (isCurrentSerializedCalculation(data)) {
    const inputs = deserializeInputs(data.inputs);
    return {
      id: data.id,
      createdAt: data.createdAt,
      name: data.name,
      inputs,
      results: calculateLoan(inputs),
    };
  }

  return deserializeLegacyCalculation(data);
};

export const saveCalculation = async (
  inputs: LoanInputs,
  results: LoanCalculationResult,
  name?: string,
): Promise<SavedCalculation> => {
  try {
    const history = await getCalculationHistory();

    const newCalculation: SavedCalculation = {
      id: Date.now().toString(),
      inputs: inputs,
      results: results,
      createdAt: new Date().toISOString(),
      name,
    };

    // Add to beginning and limit to max items
    const updatedHistory = [newCalculation, ...history]
      .slice(0, MAX_HISTORY_ITEMS)
      .map(serializeSavedCalculation);

    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

    return newCalculation;
  } catch (error) {
    console.error('Error saving calculation:', error);
    throw new Error('Failed to save calculation', { cause: error });
  }
};

export const getCalculationHistory = async (): Promise<SavedCalculation[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (!historyJson) {
      return [];
    }

    const history = JSON.parse(historyJson) as Array<
      SerializedSavedCalculation | LegacySerializedSavedCalculation
    >;
    return history.map(deserializeCalculation);
  } catch (error) {
    console.error('Error getting calculation history:', error);
    return [];
  }
};

export const deleteCalculation = async (id: string): Promise<void> => {
  try {
    const history = await getCalculationHistory();
    const updatedHistory = history.filter((item) => item.id !== id);

    const serializedHistory = updatedHistory.map(serializeSavedCalculation);

    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(serializedHistory));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw new Error('Failed to delete calculation', { cause: error });
  }
};

export const clearCalculationHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw new Error('Failed to clear history', { cause: error });
  }
};

export const getCalculationById = async (id: string): Promise<SavedCalculation | null> => {
  try {
    const history = await getCalculationHistory();
    return history.find((item) => item.id === id) || null;
  } catch (error) {
    console.error('Error getting calculation by id:', error);
    return null;
  }
};
