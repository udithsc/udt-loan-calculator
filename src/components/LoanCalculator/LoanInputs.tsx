import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { NumberInput } from '../common/NumberInput';
import { CurrencySelector } from '../common/CurrencySelector';
import { Currency, RepaymentType, LoanType, LOAN_TYPE_CONFIGS } from '../../types/loan';
import { formatDate } from '../../utils/formatters';
import { useTheme, radius, spacing, fontSize } from '../../context/ThemeContext';

interface LoanInputsProps {
  loanAmount: string;
  durationYears: string;
  durationMonths: string;
  interestRate: string;
  extraMonthlyPayment: string;
  repaymentType: RepaymentType;
  startDate: Date;
  currency: Currency;
  loanType?: LoanType;
  onLoanAmountChange: (value: string) => void;
  onDurationYearsChange: (value: string) => void;
  onDurationMonthsChange: (value: string) => void;
  onInterestRateChange: (value: string) => void;
  onExtraMonthlyPaymentChange: (value: string) => void;
  onRepaymentTypeChange: (type: RepaymentType) => void;
  onStartDateChange: (date: Date) => void;
  onCurrencyChange: (currency: Currency) => void;
  errors?: {
    loanAmount?: string | null;
    duration?: string | null;
    interestRate?: string | null;
    extraMonthlyPayment?: string | null;
  };
}

export const LoanInputs: React.FC<LoanInputsProps> = ({
  loanAmount,
  durationYears,
  durationMonths,
  interestRate,
  extraMonthlyPayment,
  repaymentType,
  startDate,
  currency,
  loanType,
  onLoanAmountChange,
  onDurationYearsChange,
  onDurationMonthsChange,
  onInterestRateChange,
  onExtraMonthlyPaymentChange,
  onRepaymentTypeChange,
  onStartDateChange,
  onCurrencyChange,
  errors = {},
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  const loanConfig = loanType ? LOAN_TYPE_CONFIGS.find((c) => c.type === loanType) : null;
  const durationPresets = [
    { label: '1Y', months: 12 },
    { label: '3Y', months: 36 },
    { label: '5Y', months: 60 },
    { label: '15Y', months: 180 },
    { label: '30Y', months: 360 },
  ].filter(
    (preset) => !loanConfig?.maxDurationMonths || preset.months <= loanConfig.maxDurationMonths,
  );

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      onStartDateChange(selectedDate);
    }
  };

  const applyDurationPreset = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    onDurationYearsChange(years.toString());
    onDurationMonthsChange(remainingMonths.toString());
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Loan details</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          Enter the basics to estimate your repayment plan.
        </Text>
      </View>

      {/* Amount & Currency Row */}
      <View style={styles.row}>
        <View style={styles.flex2}>
          <NumberInput
            label="Amount"
            value={loanAmount}
            onChangeText={onLoanAmountChange}
            placeholder="0"
            keyboardType="numeric"
            error={errors.loanAmount}
          />
        </View>
        <View style={styles.flex1}>
          <Text style={[styles.label, { color: colors.foreground }]}>Currency</Text>
          <CurrencySelector selectedCurrency={currency} onSelect={onCurrencyChange} />
        </View>
      </View>

      {/* Duration Row */}
      <Text style={[styles.label, { color: colors.foreground }]}>Duration</Text>
      <View style={styles.durationRow}>
        <View style={styles.durationInput}>
          <NumberInput
            value={durationYears}
            onChangeText={onDurationYearsChange}
            placeholder="0"
            keyboardType="numeric"
            error={errors.duration}
            accessibilityLabel="Duration years"
          />
          <Text style={[styles.durationLabel, { color: colors.mutedForeground }]}>years</Text>
        </View>
        <View style={styles.durationInput}>
          <NumberInput
            value={durationMonths}
            onChangeText={onDurationMonthsChange}
            placeholder="0"
            keyboardType="numeric"
            accessibilityLabel="Duration months"
          />
          <Text style={[styles.durationLabel, { color: colors.mutedForeground }]}>months</Text>
        </View>
      </View>
      <View style={styles.presetRow}>
        {durationPresets.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            style={[styles.presetChip, { backgroundColor: colors.secondary }]}
            onPress={() => applyDurationPreset(preset.months)}
            activeOpacity={0.75}
          >
            <Text style={[styles.presetChipText, { color: colors.secondaryForeground }]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Interest Rate */}
      <NumberInput
        label="Interest Rate (%)"
        value={interestRate}
        onChangeText={onInterestRateChange}
        placeholder={loanConfig?.defaultInterestRate?.toString() || '0'}
        keyboardType="decimal-pad"
        error={errors.interestRate}
      />

      <NumberInput
        label="Extra Monthly Payment"
        value={extraMonthlyPayment}
        onChangeText={onExtraMonthlyPaymentChange}
        placeholder="0"
        keyboardType="decimal-pad"
        error={errors.extraMonthlyPayment}
      />

      {/* Repayment Type */}
      <Text style={[styles.label, { color: colors.foreground }]}>Repayment Type</Text>
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segment,
            { borderColor: colors.input, backgroundColor: colors.surfaceElevated },
            repaymentType === 'equated' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => onRepaymentTypeChange('equated')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ selected: repaymentType === 'equated' }}
          accessibilityLabel="Fixed EMI repayment type"
        >
          <Text
            style={[
              styles.segmentText,
              { color: repaymentType === 'equated' ? colors.primaryForeground : colors.foreground },
            ]}
          >
            EMI (Fixed)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            { borderColor: colors.input, backgroundColor: colors.surfaceElevated },
            repaymentType === 'reducing' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => onRepaymentTypeChange('reducing')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ selected: repaymentType === 'reducing' }}
          accessibilityLabel="Reducing balance repayment type"
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: repaymentType === 'reducing' ? colors.primaryForeground : colors.foreground,
              },
            ]}
          >
            Reducing
          </Text>
        </TouchableOpacity>
      </View>

      {/* Start Date */}
      <Text style={[styles.label, { color: colors.foreground }]}>Start Date</Text>
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            borderColor: colors.input,
            backgroundColor: colors.surfaceElevated,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Start date ${formatDate(startDate)}`}
      >
        <Text style={[styles.dateButtonText, { color: colors.foreground }]}>
          {formatDate(startDate)}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <TouchableOpacity
          style={[styles.datePickerClose, { backgroundColor: colors.secondary }]}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={[styles.datePickerCloseText, { color: colors.secondaryForeground }]}>
            Done
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionHeader: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  durationInput: {
    flex: 1,
  },
  durationLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetChip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  presetChipText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  segmentedControl: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  segmentText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  dateButton: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 1,
  },
  dateButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  datePickerClose: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  datePickerCloseText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
