import React from 'react';
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
import { useTheme, ThemeMode, radius, spacing, fontSize } from '../context/ThemeContext';
import { clearCalculationHistory } from '../services/storageService';

type RootStackParamList = {
    Home: undefined;
    Settings: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const { colors, themeMode, setThemeMode } = useTheme();

    const handleClearHistory = () => {
        Alert.alert(
            'Clear History',
            'Delete all saved calculations?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearCalculationHistory();
                            Alert.alert('Done', 'History cleared.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear history.');
                        }
                    },
                },
            ]
        );
    };

    const ThemeOption: React.FC<{ mode: ThemeMode; label: string }> = ({
        mode,
        label,
    }) => (
        <TouchableOpacity
            style={[
                styles.themeOption,
                {
                    backgroundColor: themeMode === mode ? colors.primary : colors.background,
                    borderColor: themeMode === mode ? colors.primary : colors.input,
                },
            ]}
            onPress={() => setThemeMode(mode)}
        >
            <Text
                style={[
                    styles.themeLabel,
                    { color: themeMode === mode ? colors.primaryForeground : colors.foreground },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

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
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Theme Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Theme</Text>
                    <View style={styles.themeOptions}>
                        <ThemeOption mode="light" label="Light" />
                        <ThemeOption mode="dark" label="Dark" />
                        <ThemeOption mode="system" label="System" />
                    </View>
                </View>

                {/* Data Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Data</Text>
                    <TouchableOpacity
                        style={[styles.dangerButton, { borderColor: colors.destructive }]}
                        onPress={handleClearHistory}
                    >
                        <Text style={[styles.dangerButtonText, { color: colors.destructive }]}>
                            Clear History
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
                    <View style={[styles.infoCard, { borderColor: colors.border }]}>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
    },
    section: {
        marginBottom: spacing['3xl'],
    },
    sectionTitle: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    themeOptions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    themeOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    themeLabel: {
        fontSize: fontSize.sm,
        fontWeight: '500',
    },
    dangerButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    dangerButtonText: {
        fontSize: fontSize.sm,
        fontWeight: '500',
    },
    infoCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: 'hidden',
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
        fontWeight: '500',
    },
    divider: {
        height: 1,
    },
});
