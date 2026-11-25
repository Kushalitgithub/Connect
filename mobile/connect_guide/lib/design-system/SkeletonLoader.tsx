import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, StyleProp } from 'react-native';
import { colors } from './tokens';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 100,
  height = 10,
  style
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.surfaceAlt,
          borderRadius: 4,
          width: width as number,
          height: height as number,
          opacity,
        },
        style
      ]}
    />
  );
};
