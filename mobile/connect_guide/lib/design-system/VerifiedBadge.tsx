import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from './tokens';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  style
}) => {
  const sizeMap: Record<string, number> = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <View
      style={[
        {
          width: sizeMap[size],
          height: sizeMap[size],
          borderRadius: sizeMap[size] / 2,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style
      ]}
    >
      <MaterialCommunityIcons name="check" size={sizeMap[size] * 0.6} color={colors.surface} />
    </View>
  );
};
