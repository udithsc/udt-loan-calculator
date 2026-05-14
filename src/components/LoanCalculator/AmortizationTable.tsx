import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { AmortizationEntry, Currency } from '../../types/loan';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { useTheme, radius, spacing, fontSize } from '../../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AmortizationTableProps {
  schedule: AmortizationEntry[];
  currency: Currency;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedule, currency }) => {
  const { colors } = useTheme();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const toggleExpand = (month: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  const totalPayments = schedule.reduce((sum, entry) => sum + entry.payment, 0);
  const totalInterest = schedule.reduce((sum, entry) => sum + entry.interest, 0);

  const renderItem = ({ item }: { item: AmortizationEntry }) => {
    const isExpanded = expandedMonth === item.month;

    return (
      <TouchableOpacity
        style={[
          styles.row,
          { borderColor: colors.border, backgroundColor: colors.card, shadowColor: colors.shadow },
        ]}
        onPress={() => toggleExpand(item.month)}
        activeOpacity={0.7}
      >
        <View style={styles.rowMain}>
          <View style={styles.monthCol}>
            <Text style={[styles.monthNum, { color: colors.foreground }]}>Month {item.month}</Text>
            <Text style={[styles.monthDate, { color: colors.mutedForeground }]}>
              {formatDateShort(item.date)}
            </Text>
          </View>
          <Text style={[styles.paymentCol, { color: colors.foreground }]}>
            {formatCurrency(item.payment, currency)}
          </Text>
          <Text style={[styles.balanceCol, { color: colors.mutedForeground }]}>
            {formatCurrency(item.balance, currency)}
          </Text>
        </View>

        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
            <View style={styles.expandedRow}>
              <Text style={[styles.expandedLabel, { color: colors.mutedForeground }]}>
                Principal
              </Text>
              <Text style={[styles.expandedValue, { color: colors.foreground }]}>
                {formatCurrency(item.principal, currency)}
              </Text>
            </View>
            <View style={styles.expandedRow}>
              <Text style={[styles.expandedLabel, { color: colors.mutedForeground }]}>
                Interest
              </Text>
              <Text style={[styles.expandedValue, { color: colors.foreground }]}>
                {formatCurrency(item.interest, currency)}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerText, styles.monthCol, { color: colors.mutedForeground }]}>#</Text>
      <Text style={[styles.headerText, styles.paymentCol, { color: colors.mutedForeground }]}>
        Payment
      </Text>
      <Text style={[styles.headerText, styles.balanceCol, { color: colors.mutedForeground }]}>
        Balance
      </Text>
    </View>
  );

  const ListFooter = () => (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.footerRow}>
        <Text style={[styles.footerLabel, { color: colors.mutedForeground }]}>Total Paid</Text>
        <Text style={[styles.footerValue, { color: colors.foreground }]}>
          {formatCurrency(totalPayments, currency)}
        </Text>
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.footerLabel, { color: colors.mutedForeground }]}>Total Interest</Text>
        <Text style={[styles.footerValue, { color: colors.foreground }]}>
          {formatCurrency(totalInterest, currency)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={schedule}
        renderItem={renderItem}
        keyExtractor={(item) => item.month.toString()}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        stickyHeaderIndices={[0]}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  headerText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  row: {
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 1,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  monthCol: {
    width: 86,
  },
  monthNum: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  monthDate: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  paymentCol: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  balanceCol: {
    flex: 1,
    fontSize: fontSize.sm,
    textAlign: 'right',
  },
  expandedContent: {
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    marginTop: spacing.sm,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  expandedLabel: {
    fontSize: fontSize.xs,
  },
  expandedValue: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xl,
    marginTop: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  footerLabel: {
    fontSize: fontSize.sm,
  },
  footerValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
