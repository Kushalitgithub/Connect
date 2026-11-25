import React from 'react';
import { View } from 'react-native';
import { colors, radii } from './tokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = ''
}) => {
  return (
    <View
      className={`shadow-sm ${className}`}
      style={{ backgroundColor: colors.surface, borderRadius: parseInt(radii.md, 10) }}
    >
      {children}
    </View>
  );
};