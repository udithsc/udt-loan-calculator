import AsyncStorage from '@react-native-async-storage/async-storage';
import { AmortizationEntry, LoanInputs, LoanCalculationResult } from '../types/loan';

const HISTORY_STORAGE_KEY = '@loan_calculator_history';
const MAX_HISTORY_ITEMS = 20;

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

type SerializedCalculation = {
  inputs: SerializedLoanInputs;
  results: SerializedLoanCalculationResult;
};

type SerializedSavedCalculation = SerializedCalculation & {
  id: string;
  createdAt: string;
  name?: string;
};

// Serialize calculation for storage (convert Date objects to ISO strings)
const serializeCalculation = (
  inputs: LoanInputs,
  results: LoanCalculationResult,
): Pick<SerializedCalculation, 'inputs' | 'results'> => {
  return {
    inputs: {
      ...inputs,
      startDate: inputs.startDate.toISOString(),
    },
    results: {
      ...results,
      payOffDate: results.payOffDate.toISOString(),
      amortizationSchedule: results.amortizationSchedule.map((entry) => ({
        ...entry,
        date: entry.date.toISOString(),
      })),
    },
  };
};

// Deserialize calculation from storage (convert ISO strings back to Date objects)
const deserializeCalculation = (data: SerializedSavedCalculation): SavedCalculation => {
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

export const saveCalculation = async (
  inputs: LoanInputs,
  results: LoanCalculationResult,
  name?: string,
): Promise<SavedCalculation> => {
  try {
    const history = await getCalculationHistory();
    const serialized = serializeCalculation(inputs, results);

    const newCalculation: SavedCalculation = {
      id: Date.now().toString(),
      inputs: inputs,
      results: results,
      createdAt: new Date().toISOString(),
      name,
    };

    const serializedNew = {
      id: newCalculation.id,
      ...serialized,
      createdAt: newCalculation.createdAt,
      name: newCalculation.name,
    };

    // Add to beginning and limit to max items
    const updatedHistory = [
      serializedNew,
      ...history.map((item) => ({
        id: item.id,
        ...serializeCalculation(item.inputs, item.results),
        createdAt: item.createdAt,
        name: item.name,
      })),
    ].slice(0, MAX_HISTORY_ITEMS);

    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

    return newCalculation;
  } catch (error) {
    console.error('Error saving calculation:', error);
    throw new Error('Failed to save calculation');
  }
};

export const getCalculationHistory = async (): Promise<SavedCalculation[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (!historyJson) {
      return [];
    }

    const history = JSON.parse(historyJson) as SerializedSavedCalculation[];
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

    const serializedHistory = updatedHistory.map((item) => ({
      id: item.id,
      ...serializeCalculation(item.inputs, item.results),
      createdAt: item.createdAt,
      name: item.name,
    }));

    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(serializedHistory));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw new Error('Failed to delete calculation');
  }
};

export const clearCalculationHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw new Error('Failed to clear history');
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
