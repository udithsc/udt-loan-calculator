import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Currency } from '../../types/loan';
import { CURRENCIES } from '../../constants/currencies';
import { useTheme, radius, spacing, fontSize } from '../../context/ThemeContext';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onSelect: (currency: Currency) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();

  const filteredCurrencies = CURRENCIES.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, {
          backgroundColor: colors.background,
          borderColor: colors.input,
        }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        accessibilityLabel={`Currency: ${selectedCurrency.name}`}
        accessibilityRole="button"
      >
        <Text style={[styles.selectorText, { color: colors.foreground }]}>
          {selectedCurrency.code}
        </Text>
        <Text style={[styles.chevron, { color: colors.mutedForeground }]}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.popover }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Select Currency
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                accessibilityLabel="Close"
              >
                <Text style={[styles.closeButtonText, { color: colors.mutedForeground }]}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
              <TextInput
                style={[styles.searchInput, {
                  color: colors.foreground,
                  backgroundColor: colors.muted,
                  borderColor: colors.input,
                }]}
                placeholder="Search..."
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* List */}
            <FlatList
              data={filteredCurrencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyItem,
                    { borderBottomColor: colors.border },
                    selectedCurrency.code === item.code && {
                      backgroundColor: colors.accent,
                    },
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.currencyItemLeft}>
                    <Text style={[styles.currencyCode, { color: colors.foreground }]}>
                      {item.code}
                    </Text>
                    <Text style={[styles.currencyName, { color: colors.mutedForeground }]}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={[styles.currencySymbol, { color: colors.mutedForeground }]}>
                    {item.symbol}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No results found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.md,
    height: 40,
  },
  selectorText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  chevron: {
    fontSize: fontSize.lg,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 24,
    lineHeight: 24,
  },
  searchContainer: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    fontSize: fontSize.sm,
    borderWidth: 1,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  currencyItemLeft: {
    flex: 1,
  },
  currencyCode: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: fontSize.xs,
  },
  currencySymbol: {
    fontSize: fontSize.base,
    fontWeight: '500',
    marginLeft: spacing.lg,
  },
  emptyContainer: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
  },
});
