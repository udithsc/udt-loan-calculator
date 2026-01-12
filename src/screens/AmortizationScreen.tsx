import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AmortizationTable } from '../components/LoanCalculator/AmortizationTable';
import {
  LoanCalculationResult,
  LoanInputs as LoanInputsType,
} from '../types/loan';
import { shareAmortizationSchedule, sendLoanResultsByEmail, shareLoanResults } from '../services/shareService';
import { useTheme, radius, spacing, fontSize } from '../context/ThemeContext';
import { formatCurrency, formatDuration, formatPercentage } from '../utils/formatters';

type RootStackParamList = {
  Home: undefined;
  Calculator: { loanType: string };
  Amortization: { results: LoanCalculationResult; inputs: LoanInputsType };
};

type AmortizationScreenRouteProp = RouteProp<RootStackParamList, 'Amortization'>;
type AmortizationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Amortization'
>;

export const AmortizationScreen: React.FC = () => {
  const navigation = useNavigation<AmortizationScreenNavigationProp>();
  const route = useRoute<AmortizationScreenRouteProp>();
  const { results, inputs } = route.params;
  const { colors } = useTheme();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    setShareModalVisible(false);
    setIsLoading(true);
    try {
      const loanResults = { ...inputs, ...results };
      await shareAmortizationSchedule(loanResults);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareSummary = async () => {
    setShareModalVisible(false);
    setIsLoading(true);
    try {
      const loanResults = { ...inputs, ...results };
      await shareLoanResults(loanResults);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmail = async () => {
    setShareModalVisible(false);
    setIsLoading(true);
    try {
      const loanResults = { ...inputs, ...results };
      await sendLoanResultsByEmail(loanResults);
    } finally {
      setIsLoading(false);
    }
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
          Schedule
        </Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => setShareModalVisible(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.foreground} />
          ) : (
            <Text style={[styles.shareButtonText, { color: colors.foreground }]}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      <View style={[styles.summaryBar, { borderBottomColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatCurrency(inputs.loanAmount, inputs.currency)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            Principal
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatPercentage(inputs.interestRate, 1)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            Rate
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatDuration(inputs.durationMonths)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            Duration
          </Text>
        </View>
      </View>

      <AmortizationTable schedule={results.amortizationSchedule} currency={inputs.currency} />

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.popover }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Share</Text>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleShareSummary}
            >
              <Text style={[styles.modalOptionText, { color: colors.foreground }]}>
                Share Summary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleShare}
            >
              <Text style={[styles.modalOptionText, { color: colors.foreground }]}>
                Share Full Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleEmail}
            >
              <Text style={[styles.modalOptionText, { color: colors.foreground }]}>
                Send via Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShareModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
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
  shareButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  shareButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  summaryBar: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  modalContent: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    padding: spacing.lg,
    textAlign: 'center',
  },
  modalOption: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  modalCancel: {
    padding: spacing.lg,
  },
  modalCancelText: {
    fontSize: fontSize.base,
    textAlign: 'center',
  },
});
