import React, { ComponentProps, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  LoanCalculationResult,
  LoanInputs as LoanInputsType,
  LoanType,
  LOAN_TYPE_CONFIGS,
} from '../types/loan';
import { useTheme, radius, spacing, fontSize } from '../context/ThemeContext';
import {
  deleteCalculation,
  getCalculationHistory,
  SavedCalculation,
} from '../services/storageService';
import { getNextPaymentSummary } from '../services/loanCalculator';
import { formatCurrency, formatDate, formatDuration } from '../utils/formatters';

type RootStackParamList = {
  Home: undefined;
  Calculator: { loanType: LoanType };
  Settings: undefined;
  Amortization: { results: LoanCalculationResult; inputs: LoanInputsType };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const loanTypeIcons: Record<
  LoanType,
  {
    name: MaterialCommunityIconName;
    tint: string;
    background: string;
  }
> = {
  personal: {
    name: 'account-cash',
    tint: '#2563eb',
    background: '#dbeafe',
  },
  mortgage: {
    name: 'home-analytics',
    tint: '#059669',
    background: '#d1fae5',
  },
  auto: {
    name: 'car-sports',
    tint: '#7c3aed',
    background: '#ede9fe',
  },
  business: {
    name: 'briefcase-variant',
    tint: '#ea580c',
    background: '#ffedd5',
  },
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const savedHistory = await getCalculationHistory();
      setHistory(savedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const handleLoanTypeSelect = (loanType: LoanType) => {
    navigation.navigate('Calculator', { loanType });
  };

  const handleHistoryItemPress = (item: SavedCalculation) => {
    navigation.navigate('Amortization', {
      results: item.results,
      inputs: item.inputs,
    });
  };

  const handleDeleteSavedLoan = async (id: string) => {
    try {
      await deleteCalculation(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting saved loan:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <View style={styles.heroTop}>
            <View style={[styles.logoMark, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons
                name="calculator-variant"
                size={24}
                color={colors.secondaryForeground}
              />
            </View>
            <TouchableOpacity
              style={[styles.settingsButton, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('Settings')}
              accessibilityLabel="Settings"
            >
              <MaterialCommunityIcons name="cog" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Smart loan planning</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Calculate payments with confidence.
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Compare loan types, save calculations, and inspect your monthly schedule.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Choose a calculator
          </Text>
          <View style={styles.loanTypesGrid}>
            {LOAN_TYPE_CONFIGS.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.loanTypeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  },
                  !item.enabled && { opacity: 0.5 },
                ]}
                onPress={() => handleLoanTypeSelect(item.type)}
                disabled={!item.enabled}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.description}`}
                accessibilityState={{ disabled: !item.enabled }}
              >
                <View
                  style={[
                    styles.loanTypeIconWrap,
                    {
                      backgroundColor: loanTypeIcons[item.type].background,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={loanTypeIcons[item.type].name}
                    size={26}
                    color={loanTypeIcons[item.type].tint}
                  />
                </View>
                <Text style={[styles.loanTypeTitle, { color: colors.cardForeground }]}>
                  {item.title}
                </Text>
                <Text style={[styles.loanTypeDescription, { color: colors.mutedForeground }]}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Saved Loans</Text>
            {history.length > 0 && (
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                {history.length} saved
              </Text>
            )}
          </View>
          {history.length > 0 ? (
            history.slice(0, 10).map((item) => {
              const nextPayment = getNextPaymentSummary(item.results);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.historyItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      shadowColor: colors.shadow,
                    },
                  ]}
                  onPress={() => handleHistoryItemPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Saved loan ${
                    item.name || item.inputs.repaymentType
                  }, ${formatCurrency(item.inputs.loanAmount, item.inputs.currency)}`}
                >
                  <View style={styles.historyItemContent}>
                    <Text style={[styles.historyLabel, { color: colors.primary }]}>
                      {item.name ||
                        (item.inputs.repaymentType === 'equated'
                          ? 'Fixed EMI'
                          : 'Reducing balance')}
                    </Text>
                    <Text style={[styles.historyAmount, { color: colors.foreground }]}>
                      {formatCurrency(item.inputs.loanAmount, item.inputs.currency)}
                    </Text>
                    <Text style={[styles.historyDetails, { color: colors.mutedForeground }]}>
                      {formatDuration(item.inputs.durationMonths)} • {item.inputs.interestRate}%
                      {item.inputs.extraMonthlyPayment
                        ? ` • +${formatCurrency(item.inputs.extraMonthlyPayment, item.inputs.currency)}/mo`
                        : ''}
                    </Text>
                    {nextPayment && (
                      <View style={styles.nextPaymentBlock}>
                        <View style={styles.nextPaymentRow}>
                          <Text
                            style={[styles.nextPaymentLabel, { color: colors.mutedForeground }]}
                          >
                            Next
                          </Text>
                          <Text style={[styles.nextPaymentValue, { color: colors.foreground }]}>
                            {formatCurrency(nextPayment.payment, item.inputs.currency)}
                          </Text>
                        </View>
                        <Text style={[styles.nextPaymentDate, { color: colors.mutedForeground }]}>
                          Due {formatDate(nextPayment.date)} • Balance after{' '}
                          {formatCurrency(nextPayment.balanceAfterPayment, item.inputs.currency)}
                        </Text>
                        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                backgroundColor: colors.primary,
                                width: `${Math.min(100, nextPayment.progress)}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                    {!nextPayment && (
                      <Text style={[styles.nextPaymentDate, { color: colors.accentForeground }]}>
                        Paid off or no upcoming payments
                      </Text>
                    )}
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={[styles.historyPayment, { color: colors.foreground }]}>
                      {formatCurrency(item.results.monthlyPayment, item.inputs.currency)}
                    </Text>
                    <Text style={[styles.historyPaymentLabel, { color: colors.mutedForeground }]}>
                      /month
                    </Text>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: colors.muted }]}
                      onPress={(event) => {
                        event.stopPropagation();
                        handleDeleteSavedLoan(item.id);
                      }}
                      accessibilityLabel="Delete saved loan"
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No saved loans yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Calculate a loan, then tap Save Loan to track next payment dates and balances here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  hero: {
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 5,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    lineHeight: 21,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  sectionMeta: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  loanTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  loanTypeCard: {
    width: '47%',
    minHeight: 156,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  loanTypeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 1,
  },
  loanTypeTitle: {
    fontSize: fontSize.base,
    fontWeight: '800',
  },
  loanTypeDescription: {
    fontSize: fontSize.xs,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  historyItemContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  historyAmount: {
    fontSize: fontSize.base,
    fontWeight: '800',
  },
  historyLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  historyDetails: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  historyItemRight: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
  },
  historyPayment: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  historyPaymentLabel: {
    fontSize: fontSize.xs,
  },
  nextPaymentBlock: {
    marginTop: spacing.md,
  },
  nextPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  nextPaymentLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  nextPaymentValue: {
    fontSize: fontSize.sm,
    fontWeight: '900',
  },
  nextPaymentDate: {
    fontSize: fontSize.xs,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.base,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
