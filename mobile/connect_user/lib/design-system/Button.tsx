import React from 'react';
import { Pressable, Text, ViewStyle, StyleProp } from 'react-native';
import { colors, radii } from './tokens';

interface ButtonProps {
  children?: React.ReactNode;
  title?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  title,
  variant = 'primary',
  size = 'md',
  style,
  onPress,
  disabled = false,
  className = '',
}) => {
  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    accent: { backgroundColor: colors.accent },
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: 12, paddingVertical: 8 },
    md: { paddingHorizontal: 16, paddingVertical: 12 },
    lg: { paddingHorizontal: 24, paddingVertical: 16 },
  };

  const textColors: Record<string, string> = {
    primary: colors.surface,
    secondary: colors.textPrimary,
    accent: colors.surface,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={className}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: parseInt(radii[size], 10),
        },
        variantStyles[variant],
        sizeStyles[size],
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 18,
          fontWeight: '600',
          color: textColors[variant],
        }}
      >
        {children || title}
      </Text>
    </Pressable>
  );
};
