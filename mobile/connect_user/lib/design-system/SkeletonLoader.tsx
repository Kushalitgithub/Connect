import React from 'react';
import { View } from 'react-native';
import { colors } from './tokens';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 100,
  height = 10,
  className = ''
}) => {
  return (
    <View
      className={`rounded-md animate-pulse ${className}`}
      style={{
        backgroundColor: colors.surfaceAlt,
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
      }}
    />
  );
};