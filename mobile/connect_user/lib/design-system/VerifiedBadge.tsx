import React from 'react';
import { View } from 'react-native';
import { colors } from './tokens';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeMap: Record<string, number> = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <View
      className={`rounded-full ${className}`}
      style={{ width: sizeMap[size], height: sizeMap[size], backgroundColor: colors.primary }}
    />
  );
};