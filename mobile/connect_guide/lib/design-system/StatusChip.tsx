import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { colors } from './tokens';

interface StatusChipProps {
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  children,
  className = '',
  style
}) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: colors.warningBg, text: colors.warning },
    accepted: { bg: colors.successBg, text: colors.success },
    rejected: { bg: colors.errorBg, text: colors.error },
    completed: { bg: colors.successBg, text: colors.success },
    cancelled: { bg: colors.textMuted, text: colors.surface },
  };

  const colorsForStatus = statusColors[status] || statusColors.pending;

  return (
    <View
      className={className}
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: colorsForStatus.bg,
        },
        style
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: colorsForStatus.text,
          textAlign: 'center',
        }}
      >
        {children || status.toUpperCase()}
      </Text>
    </View>
  );
};
