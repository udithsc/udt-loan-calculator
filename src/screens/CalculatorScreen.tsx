import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoanInputs } from '../components/LoanCalculator/LoanInputs';
import { LoanResults } from '../components/LoanCalculator/LoanResults';
import { Button } from '../components/common/Button';
import { calculateLoan } from '../services/loanCalculator';
import { saveCalculation } from '../services/storageService';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import {
  LoanType,
  LoanInputs as LoanInputsType,
  LoanCalculationResult,
  RepaymentType,
  LOAN_TYPE_CONFIGS,
} from '../types/loan';
import { validateLoanInputs } from '../utils/validators';
import { useTheme, radius, spacing, fontSize } from '../context/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Calculator: { loanType: LoanType };
  Amortization: { results: LoanCalculationResult; inputs: LoanInputsType };
};

type CalculatorScreenRouteProp = RouteProp<RootStackParamList, 'Calculator'>;
type CalculatorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calculator'>;

export const CalculatorScreen: React.FC = () => {
  const navigation = useNavigation<CalculatorScreenNavigationProp>();
  const route = useRoute<CalculatorScreenRouteProp>();
  const { loanType } = route.params;
  const { colors } = useTheme();

  const loanConfig = LOAN_TYPE_CONFIGS.find((c) => c.type === loanType);
  const defaultInterestRate = loanConfig?.defaultInterestRate?.toString() || '12';

  const [loanAmount, setLoanAmount] = useState('');
  const [durationYears, setDurationYears] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [interestRate, setInterestRate] = useState(defaultInterestRate);
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('equated');
  const [startDate, setStartDate] = useState(new Date());
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [results, setResults] = useState<LoanCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getTotalMonths = (): number => {
    const years = parseInt(durationYears, 10) || 0;
    const months = parseInt(durationMonths, 10) || 0;
    return years * 12 + months;
  };

  const handleCalculate = async () => {
    setError(null);

    const amount = parseFloat(loanAmount);
    const totalMonths = getTotalMonths();
    const rate = parseFloat(interestRate);

    const validationError = validateLoanInputs(amount, totalMonths, rate);
    if (validationError) {
      setError(validationError);
      setResults(null);
      return;
    }

    const inputs: LoanInputsType = {
      loanAmount: amount,
      durationYears: parseInt(durationYears, 10) || 0,
      durationMonths: totalMonths,
      interestRate: rate,
      repaymentType,
      startDate,
      currency,
    };

    const calculationResults = calculateLoan(inputs);
    setResults(calculationResults);

    try {
      setIsSaving(true);
      await saveCalculation(inputs, calculationResults);
    } catch (err) {
      console.error('Error saving calculation:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewAmortization = () => {
    if (results) {
      const inputs: LoanInputsType = {
        loanAmount: parseFloat(loanAmount),
        durationYears: parseInt(durationYears, 10) || 0,
        durationMonths: getTotalMonths(),
        interestRate: parseFloat(interestRate),
        repaymentType,
        startDate,
        currency,
      };
      navigation.navigate('Amortization', { results, inputs });
    }
  };

  const handleReset = () => {
    setLoanAmount('');
    setDurationYears('');
    setDurationMonths('');
    setInterestRate(defaultInterestRate);
    setRepaymentType('equated');
    setStartDate(new Date());
    setResults(null);
    setError(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.foreground }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {loanConfig?.title || 'Calculator'}
        </Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={[styles.resetButtonText, { color: colors.mutedForeground }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LoanInputs
            loanAmount={loanAmount}
            durationYears={durationYears}
            durationMonths={durationMonths}
            interestRate={interestRate}
            repaymentType={repaymentType}
            startDate={startDate}
            currency={currency}
            onLoanAmountChange={setLoanAmount}
            onDurationYearsChange={setDurationYears}
            onDurationMonthsChange={setDurationMonths}
            onInterestRateChange={setInterestRate}
            onRepaymentTypeChange={setRepaymentType}
            onStartDateChange={setStartDate}
            onCurrencyChange={setCurrency}
            loanType={loanType}
          />

          {error && (
            <View style={[styles.errorContainer, {
              backgroundColor: colors.destructive + '10',
              borderColor: colors.destructive + '30',
            }]}>
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          <Button
            title="Calculate"
            onPress={handleCalculate}
            variant="default"
            size="lg"
            style={styles.calculateButton}
          />

          {results && (
            <>
              <LoanResults
                loanAmount={parseFloat(loanAmount)}
                durationMonths={getTotalMonths()}
                interestRate={parseFloat(interestRate)}
                repaymentType={repaymentType}
                startDate={startDate}
                currency={currency}
                results={results}
                onViewAmortization={handleViewAmortization}
              />
              <Button
                title="View Schedule"
                onPress={handleViewAmortization}
                variant="outline"
                style={styles.scheduleButton}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  resetButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  resetButtonText: {
    fontSize: fontSize.sm,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  calculateButton: {
    marginBottom: spacing.xl,
  },
  scheduleButton: {
    marginBottom: spacing.xl,
  },
  errorContainer: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  errorText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
