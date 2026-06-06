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
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoanInputs } from '../components/LoanCalculator/LoanInputs';
import { LoanResults } from '../components/LoanCalculator/LoanResults';
import { Button } from '../components/common/Button';
import { calculateLoan, compareLoanRepaymentTypes } from '../services/loanCalculator';
import { saveCalculation } from '../services/storageService';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import {
  LoanType,
  LoanInputs as LoanInputsType,
  LoanCalculationResult,
  LoanComparison,
  RepaymentType,
  LOAN_TYPE_CONFIGS,
} from '../types/loan';
import {
  validateDuration,
  validateExtraPayment,
  validateInterestRate,
  validateLoanAmount,
  validateLoanInputs,
} from '../utils/validators';
import { useTheme, radius, spacing, fontSize } from '../context/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Calculator: { loanType: LoanType };
  Amortization: { results: LoanCalculationResult; inputs: LoanInputsType };
};

type CalculatorScreenRouteProp = RouteProp<RootStackParamList, 'Calculator'>;
type CalculatorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calculator'>;

type FieldErrors = {
  loanAmount?: string | null;
  duration?: string | null;
  interestRate?: string | null;
  extraMonthlyPayment?: string | null;
};

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
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState('');
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('equated');
  const [startDate, setStartDate] = useState(new Date());
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [results, setResults] = useState<LoanCalculationResult | null>(null);
  const [comparison, setComparison] = useState<LoanComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [loanName, setLoanName] = useState('');

  const getTotalMonths = (): number => {
    const years = parseInt(durationYears, 10) || 0;
    const months = parseInt(durationMonths, 10) || 0;
    return years * 12 + months;
  };

  const buildInputs = (): LoanInputsType => ({
    loanAmount: parseFloat(loanAmount),
    durationYears: parseInt(durationYears, 10) || 0,
    durationMonths: getTotalMonths(),
    interestRate: parseFloat(interestRate),
    repaymentType,
    startDate,
    currency,
    extraMonthlyPayment: parseFloat(extraMonthlyPayment) || 0,
  });

  const updateField = (field: keyof FieldErrors, updateValue: (value: string) => void) => {
    return (value: string) => {
      updateValue(value);
      setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: null }));
      setError(null);
    };
  };

  const handleCalculate = async () => {
    setError(null);
    setFieldErrors({});

    const amount = parseFloat(loanAmount);
    const totalMonths = getTotalMonths();
    const rate = parseFloat(interestRate);
    const extraPayment = parseFloat(extraMonthlyPayment) || 0;
    const nextFieldErrors: FieldErrors = {
      loanAmount: validateLoanAmount(amount),
      duration: validateDuration(totalMonths, loanConfig?.maxDurationMonths),
      interestRate: validateInterestRate(rate),
      extraMonthlyPayment: validateExtraPayment(extraPayment),
    };

    const validationError = validateLoanInputs(amount, totalMonths, rate, extraPayment, {
      maxDurationMonths: loanConfig?.maxDurationMonths,
    });
    if (validationError) {
      setFieldErrors(nextFieldErrors);
      setError(validationError);
      setResults(null);
      setComparison(null);
      return;
    }

    const inputs = buildInputs();

    const calculationResults = calculateLoan(inputs);
    const comparisonResults = compareLoanRepaymentTypes(inputs);
    setResults(calculationResults);
    setComparison(comparisonResults);
    setIsSaved(false);
  };

  const handleViewAmortization = () => {
    if (results) {
      navigation.navigate('Amortization', { results, inputs: buildInputs() });
    }
  };

  const handleSaveLoan = async () => {
    if (!results) {
      return;
    }

    try {
      setIsSaving(true);
      await saveCalculation(
        buildInputs(),
        results,
        loanName.trim() || `${loanConfig?.title || 'Loan'} ${new Date().toLocaleDateString()}`,
      );
      setIsSaved(true);
      setSaveModalVisible(false);
      setLoanName('');
    } catch (err) {
      console.error('Error saving calculation:', err);
      setError('Unable to save this loan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLoanAmount('');
    setDurationYears('');
    setDurationMonths('');
    setInterestRate(defaultInterestRate);
    setExtraMonthlyPayment('');
    setRepaymentType('equated');
    setStartDate(new Date());
    setResults(null);
    setComparison(null);
    setIsSaved(false);
    setError(null);
    setFieldErrors({});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerEyebrow, { color: colors.primary }]}>Calculator</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {loanConfig?.title || 'Calculator'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.secondary }]}
          onPress={handleReset}
        >
          <Text style={[styles.resetButtonText, { color: colors.secondaryForeground }]}>Reset</Text>
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
          <View
            style={[styles.formCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
          >
            <LoanInputs
              loanAmount={loanAmount}
              durationYears={durationYears}
              durationMonths={durationMonths}
              interestRate={interestRate}
              extraMonthlyPayment={extraMonthlyPayment}
              repaymentType={repaymentType}
              startDate={startDate}
              currency={currency}
              onLoanAmountChange={updateField('loanAmount', setLoanAmount)}
              onDurationYearsChange={updateField('duration', setDurationYears)}
              onDurationMonthsChange={updateField('duration', setDurationMonths)}
              onInterestRateChange={updateField('interestRate', setInterestRate)}
              onExtraMonthlyPaymentChange={updateField(
                'extraMonthlyPayment',
                setExtraMonthlyPayment,
              )}
              onRepaymentTypeChange={setRepaymentType}
              onStartDateChange={setStartDate}
              onCurrencyChange={setCurrency}
              loanType={loanType}
              errors={fieldErrors}
            />
          </View>

          {error && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: colors.destructive + '10',
                  borderColor: colors.destructive + '30',
                },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          <Button
            title="Calculate Payment"
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
                comparison={comparison}
                onViewAmortization={handleViewAmortization}
              />
              <Button
                title="View Schedule"
                onPress={handleViewAmortization}
                variant="outline"
                style={styles.scheduleButton}
              />
              <Button
                title={isSaved ? 'Saved' : 'Save Loan'}
                onPress={() => setSaveModalVisible(true)}
                variant={isSaved ? 'secondary' : 'default'}
                style={styles.scheduleButton}
                disabled={isSaved}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={saveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.saveModal,
              { backgroundColor: colors.popover, shadowColor: colors.shadow },
            ]}
          >
            <Text style={[styles.saveTitle, { color: colors.foreground }]}>Save loan</Text>
            <Text style={[styles.saveSubtitle, { color: colors.mutedForeground }]}>
              Name this loan so you can track its next payment from Saved Loans.
            </Text>
            <TextInput
              style={[
                styles.saveInput,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.input,
                  color: colors.foreground,
                },
              ]}
              value={loanName}
              onChangeText={setLoanName}
              placeholder="Loan name"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.saveActions}>
              <Button
                title="Cancel"
                onPress={() => setSaveModalVisible(false)}
                variant="outline"
                style={styles.saveActionButton}
              />
              <Button
                title={isSaving ? 'Saving...' : 'Save'}
                onPress={handleSaveLoan}
                loading={isSaving}
                style={styles.saveActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    marginTop: 2,
  },
  resetButton: {
    minWidth: 58,
    height: 40,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
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
  formCard: {
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 4,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  saveModal: {
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  saveTitle: {
    fontSize: fontSize.xl,
    fontWeight: '900',
  },
  saveSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  saveInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
  },
  saveActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  saveActionButton: {
    flex: 1,
  },
});
