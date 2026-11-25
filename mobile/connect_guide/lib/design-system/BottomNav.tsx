import React from 'react';
import { View, TouchableOpacity, Text, Platform, ViewStyle, StyleProp } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from './tokens';

interface NavItem {
  path: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface BottomNavProps {
  style?: StyleProp<ViewStyle>;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: 'view-dashboard' },
  { path: '/requests', label: 'Requests', icon: 'clock-outline' },
  { path: '/bookings', label: 'Bookings', icon: 'calendar-check' },
  { path: '/inbox', label: 'Inbox', icon: 'message-text-outline' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ style }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 8,
          paddingVertical: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        style
      ]}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <TouchableOpacity
            key={item.path}
            onPress={() => router.push(item.path as any)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
            }}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={{
                marginTop: 4,
                fontSize: 11,
                fontWeight: isActive ? '600' : '400',
                color: isActive ? colors.primary : colors.textSecondary,
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
