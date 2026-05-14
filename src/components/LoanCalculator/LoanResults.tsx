import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoanCalculationResult, LoanComparison, Currency, RepaymentType } from '../../types/loan';
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDuration,
} from '../../utils/formatters';
import { ThemeColors, useTheme, radius, spacing, fontSize } from '../../context/ThemeContext';
import { getNextPaymentSummary } from '../../services/loanCalculator';

interface LoanResultsProps {
  loanAmount: number;
  durationMonths: number;
  interestRate: number;
  repaymentType: RepaymentType;
  startDate: Date;
  currency: Currency;
  results: LoanCalculationResult | null;
  comparison?: LoanComparison | null;
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
  comparison,
}) => {
  const { colors } = useTheme();

  if (!results) {
    return null;
  }

  const paymentLabel = repaymentType === 'reducing' ? 'First Payment' : 'Monthly Payment';
  const selectedComparison =
    repaymentType === 'reducing' ? comparison?.equated : comparison?.reducing;
  const alternateLabel = repaymentType === 'reducing' ? 'Fixed EMI' : 'Reducing';
  const nextPayment = getNextPaymentSummary(results);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Text style={[styles.mainLabel, { color: colors.primaryForeground }]}>{paymentLabel}</Text>
        <Text style={[styles.mainValue, { color: colors.primaryForeground }]}>
          {formatCurrency(results.monthlyPayment, currency)}
        </Text>
        {repaymentType === 'reducing' && (
          <Text style={[styles.mainHint, { color: colors.primaryForeground }]}>
            Payments decrease monthly
          </Text>
        )}
      </View>

      <View style={styles.summaryGrid}>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            Total Interest
          </Text>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatCurrency(results.totalInterestPaid, currency)}
          </Text>
        </View>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            Total Payable
          </Text>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatCurrency(results.totalAmountPayable, currency)}
          </Text>
        </View>
      </View>

      {nextPayment && (
        <View
          style={[
            styles.nextCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.nextTitle, { color: colors.foreground }]}>Next payment</Text>
          <View style={styles.nextRow}>
            <View>
              <Text style={[styles.nextAmount, { color: colors.foreground }]}>
                {formatCurrency(nextPayment.payment, currency)}
              </Text>
              <Text style={[styles.nextMeta, { color: colors.mutedForeground }]}>
                Due {formatDate(nextPayment.date)}
              </Text>
            </View>
            <View style={styles.nextRight}>
              <Text style={[styles.nextMiniLabel, { color: colors.mutedForeground }]}>
                Balance after
              </Text>
              <Text style={[styles.nextMiniValue, { color: colors.foreground }]}>
                {formatCurrency(nextPayment.balanceAfterPayment, currency)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {selectedComparison && (
        <View
          style={[
            styles.comparisonCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.comparisonHeader}>
            <Text style={[styles.comparisonTitle, { color: colors.foreground }]}>
              Compare with {alternateLabel}
            </Text>
            <Text
              style={[
                styles.comparisonBadge,
                {
                  color:
                    comparison && comparison.interestSavingsWithReducing > 0
                      ? colors.accentForeground
                      : colors.mutedForeground,
                  backgroundColor:
                    comparison && comparison.interestSavingsWithReducing > 0
                      ? colors.accent
                      : colors.muted,
                },
              ]}
            >
              {comparison && comparison.interestSavingsWithReducing > 0
                ? `${formatCurrency(Math.abs(comparison.interestSavingsWithReducing), currency)} less interest`
                : 'Same interest'}
            </Text>
          </View>
          <View style={styles.comparisonRows}>
            <DetailRow
              label={`${alternateLabel} payment`}
              value={formatCurrency(selectedComparison.monthlyPayment, currency)}
              colors={colors}
            />
            <DetailRow
              label={`${alternateLabel} total`}
              value={formatCurrency(selectedComparison.totalAmountPayable, currency)}
              colors={colors}
              isLast
            />
          </View>
        </View>
      )}

      <View
        style={[
          styles.detailsCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <DetailRow
          label="Final Payment"
          value={formatCurrency(results.finalPayment, currency)}
          colors={colors}
        />
        <DetailRow
          label="Average Payment"
          value={formatCurrency(results.averagePayment, currency)}
          colors={colors}
        />
        <DetailRow label="Principal" value={formatCurrency(loanAmount, currency)} colors={colors} />
        <DetailRow label="Duration" value={formatDuration(durationMonths)} colors={colors} />
        <DetailRow label="Interest Rate" value={formatPercentage(interestRate)} colors={colors} />
        <DetailRow label="Start Date" value={formatDate(startDate)} colors={colors} />
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
  colors: ThemeColors;
  isLast?: boolean;
}> = ({ label, value, colors, isLast }) => (
  <View
    style={[
      styles.detailRow,
      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
    ]}
  >
    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  mainCard: {
    padding: spacing['2xl'],
    borderRadius: radius['2xl'],
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 5,
  },
  mainLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: spacing.xs,
    opacity: 0.85,
  },
  mainValue: {
    fontSize: fontSize['3xl'],
    fontWeight: '900',
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
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  nextCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  nextTitle: {
    fontSize: fontSize.base,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  nextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  nextAmount: {
    fontSize: fontSize['2xl'],
    fontWeight: '900',
  },
  nextMeta: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  nextRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 1,
  },
  nextMiniLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  nextMiniValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  comparisonCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  comparisonHeader: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  comparisonTitle: {
    fontSize: fontSize.base,
    fontWeight: '800',
  },
  comparisonBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  comparisonRows: {
    borderTopWidth: 0,
  },
  detailsCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
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
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
});
