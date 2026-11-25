import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, ActivityIndicator, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

type BookingType = {
  id: number;
  tour_listing_id: number;
  date: string;
  status: string;
  created_at: string;
};

type Tab = 'all' | 'pending' | 'accepted' | 'completed';

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [tab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<{ data?: BookingType[] } | BookingType[]>(
        '/bookings/my',
        { params: tab !== 'all' ? { status: tab } : {} }
      );
      const arr = Array.isArray(data) ? data : data?.data ?? [];
      setBookings(arr);
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTour = () => {
    router.push('/book/search' as any);
  };

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab);

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return '#F59E0B';
      case 'accepted': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>Track your upcoming and past tours</Text>
        </View>

        <View style={styles.tabs}>
          {(['all', 'pending', 'accepted', 'completed'] as const).map((t) => (
            <Pressable
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 && !error ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              {tab === 'all' ? <Calendar size={32} color={colors.textMuted} /> : <Clock size={32} color={colors.textMuted} />}
            </View>
            <Text style={styles.emptyTitle}>
              {tab === 'all' ? 'No bookings yet' : `No ${tab} bookings`}
            </Text>
            {tab === 'all' && (
              <Pressable style={styles.exploreBtn} onPress={handleBookTour}>
                <Text style={styles.exploreBtnText}>Explore Tours</Text>
              </Pressable>
            )}
          </View>
        ) : (
          error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )
        )}

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString()}</Text>
                <Text style={styles.cardTourId}>Tour #{item.tour_listing_id}</Text>
              </View>
              <View style={styles.cardRight}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
                {item.status === 'accepted' && (
                  <Pressable style={styles.bookBtn} onPress={() => router.push(`/bookings/${item.id}` as any)}>
                    <View style={styles.bookRow}>
                      <Calendar size={14} color={colors.primary} />
                      <Text style={styles.bookBtnText}>View Details</Text>
                    </View>
                  </Pressable>
                )}
              </View>
            </Pressable>
          )}
        </FlatList>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  exploreBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  exploreBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLeft: { gap: 4 },
  cardDate: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardTourId: { fontSize: 12, color: colors.textSecondary },
  cardRight: { gap: 8, alignItems: 'flex-end' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  bookBtn: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bookBtnText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
});
