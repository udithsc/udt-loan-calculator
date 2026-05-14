import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, radius, spacing, fontSize } from '../../context/ThemeContext';

interface NumberInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'numeric',
  style,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: error ? colors.destructive : colors.input,
            color: colors.foreground,
            shadowColor: colors.shadow,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={placeholder}
      />
      {error && (
        <Text style={[styles.errorText, { color: colors.destructive }]} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    height: 48,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 1,
  },
  errorText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
