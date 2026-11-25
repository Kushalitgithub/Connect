import React from 'react';
import { View, Text, TouchableOpacity, Platform, ViewStyle, StyleProp } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from './tokens';

interface TopStatusBarProps {
  title: string;
  leftAction?: () => void;
  rightAction?: () => void;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  title,
  leftAction,
  rightAction,
  leftIcon,
  rightIcon,
  style
}) => {
  return (
    <View style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
        paddingBottom: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      style
    ]}>
      <StatusBar style="light" />

      {/* Left side */}
      <View style={{ width: 40 }}>
        {leftIcon && leftAction && (
          <TouchableOpacity onPress={leftAction}>
            <MaterialCommunityIcons name={leftIcon} size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center - Title */}
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
        textAlign: 'center',
      }}>
        {title}
      </Text>

      {/* Right side */}
      <View style={{ width: 40, alignItems: 'flex-end' }}>
        {rightIcon && rightAction && (
          <TouchableOpacity onPress={rightAction}>
            <MaterialCommunityIcons name={rightIcon} size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
