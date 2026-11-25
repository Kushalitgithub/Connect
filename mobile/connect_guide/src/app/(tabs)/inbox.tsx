import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopStatusBar } from '../../../lib/design-system/TopStatusBar';
import { BottomNav } from '../../../lib/design-system/BottomNav';
import { colors } from '../../../lib/design-system/tokens';

export default function InboxPage() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopStatusBar title="Inbox" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialCommunityIcons name="message-text-outline" size={64} color={colors.textMuted} />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
          Inbox Coming Soon
        </Text>
        <Text style={{ marginTop: 8, color: colors.textSecondary, textAlign: 'center' }}>
          Chat functionality will be available in a future update. You'll be able to communicate with tourists here.
        </Text>
      </View>
      <BottomNav />
    </View>
  );
}
