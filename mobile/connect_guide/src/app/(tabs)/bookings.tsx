import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Calendar, Clock, UserCheck } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

type BookingType = {
  id: number;
  tour_listing: { id: number; title: string; price: number };
  tourist: { id: number; email: string };
  date: string;
  status: string;
  num_clients: number;
  created_at: string;
};

export default function GuideBookingsScreen() {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<BookingType[]>('/guide/dashboard/bookings');
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Guide Bookings</Text>
          <Text style={styles.subtitle}>Scheduled, active, and past tours</Text>
        </View>

        <View style={styles.tabsRow}>
          <Pressable style={[styles.tabBtn, styles.activeTabBtn]}>
            <Text style={[styles.tabText, styles.activeTabText]}>All Bookings</Text>
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Bookings</Text>
              <Text style={styles.emptySubtitle}>Your tours' bookings will appear here.</Text>
            </View>
          ) : (
            bookings.map((b) => (
              <View key={b.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.tourTitle}>{b.tour_listing.title}</Text>
                  <Text style={styles.price}>${b.tour_listing.price}</Text>
                </View>
                <View style={styles.detailRow}>
                  <UserCheck size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>Tourist: {b.tourist.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{b.date}</Text>
                  <Clock size={14} color={colors.textSecondary} style={{ marginLeft: 10 }} />
                  <Text style={styles.detailText}>{b.num_clients} client(s)</Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={[styles.statusLabel, { color: statusColor(b.status) }]}>
                    {b.status}
                  </Text>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const statusColor = (s: string) => {
  switch (s) {
    case 'pending': return '#F59E0B';
    case 'accepted': return '#10B981';
    case 'completed': return '#3B82F6';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  tabsRow: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTabBtn: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  activeTabText: { color: colors.textPrimary },
  listContent: { gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tourTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  price: { fontSize: 15, fontWeight: '800', color: colors.primary },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: colors.textSecondary },
  statusRow: { marginTop: 8 },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  emptyState: { paddingVertical: 50, alignItems: 'center' },
  emptyTitle: { fontSize: 14, color: colors.textSecondary },
  emptySubtitle: { fontSize: 12, color: colors.textMuted ?? '#9CA3AF', marginTop: 4 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
});
