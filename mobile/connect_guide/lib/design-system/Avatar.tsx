import React from 'react';
import { View, Image, Text, ViewStyle, StyleProp } from 'react-native';
import { colors, radii } from './tokens';

interface AvatarProps {
  source?: { uri: string }; // For network images
  size?: 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  placeholder?: string; // Initials or fallback text
  style?: StyleProp<ViewStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'md',
  radius = 'md',
  placeholder,
  style
}) => {
  const sizeMap: Record<string, number> = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  };

  const radiusMap: Record<string, number | string> = {
    sm: parseInt(radii.sm),
    md: parseInt(radii.md),
    lg: parseInt(radii.lg),
    xl: parseInt(radii.xl),
    full: 999
  };

  const avatarSize = sizeMap[size];
  const avatarRadius = radiusMap[radius];

  return (
    <View
      style={[
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: typeof avatarRadius === 'number' ? avatarRadius : 999,
          overflow: 'hidden',
        },
        style
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
        }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.surface }}>
            {placeholder?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
    </View>
  );
};
