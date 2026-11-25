import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Compass, Users, DollarSign, Star, ShieldCheck, ChevronRight, PlusCircle } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

export default function GuideDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<{
    pending_requests: number;
    confirmed_bookings: number;
    total_earnings: number;
    total_tours: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/guide/dashboard/overview');
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard stats. Please try again later.');
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Guide Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.guideName}>Welcome, Guide</Text>
              <ShieldCheck size={18} color={colors.primary} />
            </View>
            <Text style={styles.badgeText}>Verified Local Guide</Text>
          </View>
          <Pressable
            style={styles.addTourBtn}
            onPress={() => router.push('/(tabs)/dashboard/tour-create' as any)}
          >
            <PlusCircle size={16} color="#FFFFFF" />
            <Text style={styles.addTourText}>New Tour</Text>
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {stats && (
            <>
              <View style={styles.metricCard}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.metricNumber}>{stats.confirmed_bookings}</Text>
                <Text style={styles.metricLabel}>Confirmed Bookings</Text>
              </View>
              <View style={styles.metricCard}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.metricNumber}>${stats.total_earnings?.toFixed(0) ?? '0'}</Text>
                <Text style={styles.metricLabel}>Net Earnings</Text>
              </View>
              <View style={styles.metricCard}>
                <Star size={20} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.metricNumber}>5.0</Text>
                <Text style={styles.metricLabel}>Rating</Text>
              </View>
              <View style={styles.metricCard}>
                <Compass size={20} color={colors.primary} />
                <Text style={styles.metricNumber}>{stats.total_tours}</Text>
                <Text style={styles.metricLabel}>Total Tours</Text>
              </View>
            </>
          )}
        </View>

        {/* Pending requests quick stat */}
        {stats && stats.pending_requests > 0 && (
          <View style={styles.alertCard}>
            <Users size={18} color="#F59E0B" />
            <Text style={styles.alertText}>
              You have {stats.pending_requests} pending booking request(s).
            </Text>
            <Pressable style={styles.alertBtn} onPress={() => router.push('/(tabs)/requests' as any)}>
              <Text style={styles.alertBtnText}>Respond Now</Text>
            </Pressable>
          </View>
        )}

        {/* Quick Hub Navigation */}
        <View style={styles.hubSection}>
          <Text style={styles.sectionTitle}>Manage Listings & Availability</Text>

          <Pressable
            style={styles.hubCard}
            onPress={() => router.push('/(tabs)/dashboard/tour-create' as any)}
          >
            <Compass size={22} color={colors.primary} />
            <View style={styles.hubInfo}>
              <Text style={styles.hubTitle}>My Tours Catalog</Text>
              <Text style={styles.hubSubtitle}>View, update, or edit tour itineraries and prices</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.hubCard}
            onPress={() => router.push('/(tabs)/requests' as any)}
          >
            <Users size={22} color={colors.primary} />
            <View style={styles.hubInfo}>
              <Text style={styles.hubTitle}>Pending Booking Requests</Text>
              <Text style={styles.hubSubtitle}>Respond to tourists awaiting your decision</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideName: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  badgeText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  addTourBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addTourText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 4,
  },
  metricNumber: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  metricLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  alertCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  alertText: { fontSize: 13, color: '#92400E', flex: 1 },
  alertBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  alertBtnText: { color: '#C2410C', fontWeight: '700' },
  hubSection: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  hubInfo: { flex: 1 },
  hubTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  hubSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
});
