import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoanCalculationResult, Currency, RepaymentType } from '../../types/loan';
import { formatCurrency, formatPercentage, formatDate, formatDuration } from '../../utils/formatters';
import { useTheme, radius, spacing, fontSize } from '../../context/ThemeContext';

interface LoanResultsProps {
  loanAmount: number;
  durationMonths: number;
  interestRate: number;
  repaymentType: RepaymentType;
  startDate: Date;
  currency: Currency;
  results: LoanCalculationResult | null;
  onViewAmortization: () => void;
}

export const LoanResults: React.FC<LoanResultsProps> = ({
  loanAmount,
  durationMonths,
  interestRate,
  repaymentType,
  startDate,
  currency,
  results,
}) => {
  const { colors } = useTheme();

  if (!results) {
    return null;
  }

  const paymentLabel = repaymentType === 'reducing'
    ? 'First Payment'
    : 'Monthly Payment';

  return (
    <View style={styles.container}>
      {/* Main Result */}
      <View style={[styles.mainCard, {
        backgroundColor: colors.card,
        borderColor: colors.border,
      }]}>
        <Text style={[styles.mainLabel, { color: colors.mutedForeground }]}>
          {paymentLabel}
        </Text>
        <Text style={[styles.mainValue, { color: colors.foreground }]}>
          {formatCurrency(results.monthlyPayment, currency)}
        </Text>
        {repaymentType === 'reducing' && (
          <Text style={[styles.mainHint, { color: colors.mutedForeground }]}>
            Payments decrease monthly
          </Text>
        )}
      </View>

      {/* Summary Grid */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, {
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            Total Interest
          </Text>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatCurrency(results.totalInterestPaid, currency)}
          </Text>
        </View>
        <View style={[styles.summaryCard, {
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            Total Payable
          </Text>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatCurrency(results.totalAmountPayable, currency)}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={[styles.detailsCard, {
        backgroundColor: colors.card,
        borderColor: colors.border,
      }]}>
        <DetailRow
          label="Principal"
          value={formatCurrency(loanAmount, currency)}
          colors={colors}
        />
        <DetailRow
          label="Duration"
          value={formatDuration(durationMonths)}
          colors={colors}
        />
        <DetailRow
          label="Interest Rate"
          value={formatPercentage(interestRate)}
          colors={colors}
        />
        <DetailRow
          label="Start Date"
          value={formatDate(startDate)}
          colors={colors}
        />
        <DetailRow
          label="Pay-off Date"
          value={formatDate(results.payOffDate)}
          colors={colors}
          isLast
        />
      </View>
    </View>
  );
};

const DetailRow: React.FC<{
  label: string;
  value: string;
  colors: any;
  isLast?: boolean;
}> = ({ label, value, colors, isLast }) => (
  <View style={[
    styles.detailRow,
    !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
  ]}>
    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  mainCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mainLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  mainValue: {
    fontSize: fontSize['3xl'],
    fontWeight: '600',
    letterSpacing: -1,
  },
  mainHint: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  detailsCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  detailLabel: {
    fontSize: fontSize.sm,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
