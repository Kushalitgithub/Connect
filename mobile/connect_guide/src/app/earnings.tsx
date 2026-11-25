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
import { useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, ArrowUpRight, TrendingUp, Calendar } from 'lucide-react-native';
import { colors } from '../../lib/design-system/tokens';
import { api } from '../../lib/api';

export default function GuideEarningsScreen() {
  const router = useRouter();

  const [earnings, setEarnings] = useState<{
    period_days: number;
    total_earnings: number;
    completed_tours: number;
    average_per_tour: number;
    daily_breakdown: { date: string; earnings: number; tour_count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/guide/dashboard/earnings', { params: { days: 30 } });
      setEarnings(data);
    } catch (err) {
      setError('Failed to load earnings. Please try again later.');
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
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Earnings & History</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Balance Summary Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              ${(earnings?.total_earnings ?? 0).toFixed(2)}
            </Text>
            <View style={styles.statRow}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.statText}>
                +${(earnings?.total_earnings ?? 0).toFixed(2)} earned this month
              </Text>
            </View>
          </View>

          {/* Transactions List */}
          <Text style={styles.sectionTitle}>Recent Tour Earnings</Text>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <View style={styles.txList}>
            {(earnings?.daily_breakdown ?? []).map((day) => (
              <View key={day.date} style={styles.txCard}>
                <View style={styles.iconBox}>
                  <ArrowUpRight size={20} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTour}>{day.tour_count} Tour(s)</Text>
                  <Text style={styles.txTourist}>Completed bookings</Text>
                  <Text style={styles.txDate}>{day.date}</Text>
                </View>
                <Text style={styles.txAmount}>+${day.earnings.toFixed(2)}</Text>
              </View>
            ))}
            {(earnings?.daily_breakdown?.length ?? 0) === 0 && (
              <Text style={styles.emptyText}>No earnings yet. Complete a tour to start earning.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  scrollContent: { padding: 20, gap: 16 },
  balanceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: '#FFFFFF' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  txList: { gap: 10 },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTour: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  txTourist: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  txDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '800', color: '#10B981' },
  emptyText: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 20 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
});
