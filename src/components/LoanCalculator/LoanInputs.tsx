import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  repaymentType: RepaymentType;
  startDate: Date;
  currency: Currency;
  loanType?: LoanType;
  onLoanAmountChange: (value: string) => void;
  onDurationYearsChange: (value: string) => void;
  onDurationMonthsChange: (value: string) => void;
  onInterestRateChange: (value: string) => void;
  onRepaymentTypeChange: (type: RepaymentType) => void;
  onStartDateChange: (date: Date) => void;
  onCurrencyChange: (currency: Currency) => void;
}

export const LoanInputs: React.FC<LoanInputsProps> = ({
  loanAmount,
  durationYears,
  durationMonths,
  interestRate,
  repaymentType,
  startDate,
  currency,
  loanType,
  onLoanAmountChange,
  onDurationYearsChange,
  onDurationMonthsChange,
  onInterestRateChange,
  onRepaymentTypeChange,
  onStartDateChange,
  onCurrencyChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  const loanConfig = loanType
    ? LOAN_TYPE_CONFIGS.find((c) => c.type === loanType)
    : null;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      onStartDateChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Amount & Currency Row */}
      <View style={styles.row}>
        <View style={styles.flex2}>
          <NumberInput
            label="Amount"
            value={loanAmount}
            onChangeText={onLoanAmountChange}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.flex1}>
          <Text style={[styles.label, { color: colors.foreground }]}>Currency</Text>
          <CurrencySelector
            selectedCurrency={currency}
            onSelect={onCurrencyChange}
          />
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
          />
          <Text style={[styles.durationLabel, { color: colors.mutedForeground }]}>years</Text>
        </View>
        <View style={styles.durationInput}>
          <NumberInput
            value={durationMonths}
            onChangeText={onDurationMonthsChange}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={[styles.durationLabel, { color: colors.mutedForeground }]}>months</Text>
        </View>
      </View>

      {/* Interest Rate */}
      <NumberInput
        label="Interest Rate (%)"
        value={interestRate}
        onChangeText={onInterestRateChange}
        placeholder={loanConfig?.defaultInterestRate?.toString() || "0"}
        keyboardType="decimal-pad"
      />

      {/* Repayment Type */}
      <Text style={[styles.label, { color: colors.foreground }]}>Repayment Type</Text>
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segment,
            { borderColor: colors.input },
            repaymentType === 'equated' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => onRepaymentTypeChange('equated')}
          activeOpacity={0.7}
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
            { borderColor: colors.input },
            repaymentType === 'reducing' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => onRepaymentTypeChange('reducing')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              { color: repaymentType === 'reducing' ? colors.primaryForeground : colors.foreground },
            ]}
          >
            Reducing
          </Text>
        </TouchableOpacity>
      </View>

      {/* Start Date */}
      <Text style={[styles.label, { color: colors.foreground }]}>Start Date</Text>
      <TouchableOpacity
        style={[styles.dateButton, {
          borderColor: colors.input,
          backgroundColor: colors.background,
        }]}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
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
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  durationInput: {
    flex: 1,
  },
  durationLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: -spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    marginRight: -1,
  },
  segmentText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  dateButton: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  dateButtonText: {
    fontSize: fontSize.sm,
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
