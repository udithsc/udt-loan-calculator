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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AmortizationTable } from '../components/LoanCalculator/AmortizationTable';
import { LoanCalculationResult, LoanInputs as LoanInputsType } from '../types/loan';
import {
  shareAmortizationSchedule,
  sendLoanResultsByEmail,
  shareLoanResults,
} from '../services/shareService';
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
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Schedule</Text>
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: colors.secondary }]}
          onPress={() => setShareModalVisible(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.foreground} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="share-variant"
                size={16}
                color={colors.secondaryForeground}
              />
              <Text style={[styles.shareButtonText, { color: colors.secondaryForeground }]}>
                Share
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.summaryBar,
          { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
        ]}
      >
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatCurrency(inputs.loanAmount, inputs.currency)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Principal</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatPercentage(inputs.interestRate, 1)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Rate</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {formatDuration(inputs.durationMonths)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Duration</Text>
        </View>
      </View>

      <AmortizationTable schedule={results.amortizationSchedule} currency={inputs.currency} />

      <Modal
        visible={shareModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.popover, shadowColor: colors.shadow },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Share</Text>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleShareSummary}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color={colors.primary} />
              <Text style={[styles.modalOptionText, { color: colors.foreground }]}>
                Share Summary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleShare}
            >
              <MaterialCommunityIcons name="file-table-outline" size={20} color={colors.primary} />
              <Text style={[styles.modalOptionText, { color: colors.foreground }]}>
                Share Full Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleEmail}
            >
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  shareButton: {
    minWidth: 64,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  shareButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  summaryBar: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
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
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    padding: spacing.lg,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  modalCancel: {
    padding: spacing.lg,
  },
  modalCancelText: {
    fontSize: fontSize.base,
    textAlign: 'center',
  },
});
