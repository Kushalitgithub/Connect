import React from 'react';
import { View, Text, TextInput, ViewStyle, StyleProp } from 'react-native';
import { colors, radii } from './tokens';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  label?: string;
  multiline?: boolean;
  minHeight?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  label,
  multiline = false,
  minHeight,
  className = '',
  style
}) => {
  return (
    <View className={className} style={[
      {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: parseInt(radii.md),
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      style
    ]}>
      {label && <Text style={{ marginBottom: 6, color: colors.textPrimary }}>{label}</Text>}
      <TextInput
        placeholder={placeholder}
        value={value || ''}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        style={{ fontSize: 16, color: colors.textPrimary, minHeight }}
      />
    </View>
  );
};
