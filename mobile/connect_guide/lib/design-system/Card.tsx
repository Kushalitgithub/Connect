import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors, radii } from './tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  style
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: parseInt(radii.md),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};
