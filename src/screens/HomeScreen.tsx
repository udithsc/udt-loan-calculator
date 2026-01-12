import React, { useState, useCallback } from 'react';
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
import { LoanType, LOAN_TYPE_CONFIGS } from '../types/loan';
import { useTheme, radius, spacing, fontSize } from '../context/ThemeContext';
import { getCalculationHistory, SavedCalculation, deleteCalculation } from '../services/storageService';
import { formatCurrency, formatDuration, formatDate } from '../utils/formatters';

type RootStackParamList = {
  Home: undefined;
  Calculator: { loanType: LoanType };
  Settings: undefined;
  Amortization: { results: any; inputs: any };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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
    }, [loadHistory])
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
      inputs: item.inputs
    });
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteCalculation(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting calculation:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Loan Calculator
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Calculate your loan payments
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Settings"
          >
            <Text style={[styles.settingsIcon, { color: colors.secondaryForeground }]}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Loan Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Select Loan Type
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
                  },
                  !item.enabled && { opacity: 0.5 },
                ]}
                onPress={() => handleLoanTypeSelect(item.type)}
                disabled={!item.enabled}
                activeOpacity={0.7}
              >
                <Text style={styles.loanTypeIcon}>{item.icon}</Text>
                <Text style={[styles.loanTypeTitle, { color: colors.cardForeground }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Calculations */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent
            </Text>
            {history.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.historyItem, {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }]}
                onPress={() => handleHistoryItemPress(item)}
              >
                <View style={styles.historyItemContent}>
                  <Text style={[styles.historyAmount, { color: colors.foreground }]}>
                    {formatCurrency(item.inputs.loanAmount, item.inputs.currency)}
                  </Text>
                  <Text style={[styles.historyDetails, { color: colors.mutedForeground }]}>
                    {formatDuration(item.inputs.durationMonths)} • {item.inputs.interestRate}%
                  </Text>
                </View>
                <View style={styles.historyItemRight}>
                  <Text style={[styles.historyPayment, { color: colors.foreground }]}>
                    {formatCurrency(item.results.monthlyPayment, item.inputs.currency)}
                  </Text>
                  <Text style={[styles.historyPaymentLabel, { color: colors.mutedForeground }]}>
                    /month
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['3xl'],
    marginTop: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 16,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loanTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  loanTypeCard: {
    width: '47%',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  loanTypeIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  loanTypeTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  historyItemContent: {
    flex: 1,
  },
  historyAmount: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  historyDetails: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyPayment: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  historyPaymentLabel: {
    fontSize: fontSize.xs,
  },
});
