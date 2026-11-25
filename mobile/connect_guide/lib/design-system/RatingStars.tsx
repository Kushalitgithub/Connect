import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from './tokens';

interface RatingStarsProps {
  rating: number; // 0-5
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'md',
  style
}) => {
  const sizeMap: Record<string, { starSize: number; gap: number }> = {
    sm: { starSize: 14, gap: 4 },
    md: { starSize: 20, gap: 8 },
    lg: { starSize: 28, gap: 12 }
  };

  const { starSize, gap } = sizeMap[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap,
        },
        style
      ]}
    >
      {/* Full stars */}
      {[...Array(fullStars)].map((_, index) => (
        <MaterialCommunityIcons
          key={index}
          name="star"
          size={starSize}
          color={colors.star}
        />
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <MaterialCommunityIcons
          name="star-half-full"
          size={starSize}
          color={colors.star}
        />
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <MaterialCommunityIcons
          key={index}
          name="star-outline"
          size={starSize}
          color={colors.border}
        />
      ))}
    </View>
  );
};
