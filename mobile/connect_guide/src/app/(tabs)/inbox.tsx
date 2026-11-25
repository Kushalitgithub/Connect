import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

export default function InboxPage() {
  const router = useRouter();

  const [threads, setThreads] = useState<{
    id: number;
    tourist_id: number;
    guide_id: number;
    booking_id: number | null;
    updated_at: string | null;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<{ data?: any[] } | any[]>('/chat/threads');
      const arr = Array.isArray(data) ? data : data?.data ?? [];
      setThreads(arr);
    } catch (err) {
      setError('Failed to load conversations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (id: number) => {
    router.push(`/chat/${id}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Inbox</Text>
          <Text style={styles.subtitle}>Direct chat with your tourists</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {loading && (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          )}
          {!loading && threads.length === 0 && (
            <View style={styles.emptyState}>
              <MessageSquare size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>
                Tourists will appear here once they message you.
              </Text>
            </View>
          )}
          {!loading &&
            threads.map((c) => (
              <Pressable
                key={c.id}
                style={styles.chatCard}
                onPress={() => handleOpenChat(c.id)}
              >
                <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>Tourist #{c.tourist_id}</Text>
                    <ShieldCheck size={14} color={colors.primary} />
                    <Text style={styles.time}>
                      {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  <Text style={styles.lastMsg} numberOfLines={1}>
                    Tap to open conversation
                  </Text>
                </View>
              </Pressable>
            ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  listContent: { gap: 12 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  chatInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  time: { marginLeft: 'auto', fontSize: 12, color: colors.textSecondary },
  lastMsg: { fontSize: 13, color: colors.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
});
