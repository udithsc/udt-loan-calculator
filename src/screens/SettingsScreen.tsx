import React, { ComponentProps } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, ThemeMode, radius, spacing, fontSize } from '../context/ThemeContext';
import { clearCalculationHistory } from '../services/storageService';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;
type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type ThemeOptionProps = {
  mode: ThemeMode;
  label: string;
  icon: MaterialCommunityIconName;
  selectedMode: ThemeMode;
  colors: ReturnType<typeof useTheme>['colors'];
  onSelect: (mode: ThemeMode) => void;
};

const ThemeOption: React.FC<ThemeOptionProps> = ({
  mode,
  label,
  icon,
  selectedMode,
  colors,
  onSelect,
}) => (
  <TouchableOpacity
    style={[
      styles.themeOption,
      {
        backgroundColor: selectedMode === mode ? colors.primary : colors.card,
        borderColor: selectedMode === mode ? colors.primary : colors.input,
        shadowColor: colors.shadow,
      },
    ]}
    onPress={() => onSelect(mode)}
  >
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={selectedMode === mode ? colors.primaryForeground : colors.foreground}
    />
    <Text
      style={[
        styles.themeLabel,
        { color: selectedMode === mode ? colors.primaryForeground : colors.foreground },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors, themeMode, setThemeMode } = useTheme();

  const handleClearHistory = () => {
    Alert.alert('Clear History', 'Delete all saved calculations?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearCalculationHistory();
            Alert.alert('Done', 'History cleared.');
          } catch (_error) {
            Alert.alert('Error', 'Failed to clear history.');
          }
        },
      },
    ]);
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Theme</Text>
          <View style={styles.themeOptions}>
            <ThemeOption
              mode="light"
              label="Light"
              icon="weather-sunny"
              selectedMode={themeMode}
              colors={colors}
              onSelect={setThemeMode}
            />
            <ThemeOption
              mode="dark"
              label="Dark"
              icon="moon-waning-crescent"
              selectedMode={themeMode}
              colors={colors}
              onSelect={setThemeMode}
            />
            <ThemeOption
              mode="system"
              label="System"
              icon="theme-light-dark"
              selectedMode={themeMode}
              colors={colors}
              onSelect={setThemeMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Data</Text>
          <TouchableOpacity
            style={[
              styles.dangerButton,
              { backgroundColor: colors.card, borderColor: colors.destructive },
            ]}
            onPress={handleClearHistory}
          >
            <Text style={[styles.dangerButtonText, { color: colors.destructive }]}>
              Clear History
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Version</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>1.0.0</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Name</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>Loan Calculator</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  section: {
    marginBottom: spacing['3xl'],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 1,
  },
  themeLabel: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  dangerButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  infoCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoLabel: {
    fontSize: fontSize.sm,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
});
