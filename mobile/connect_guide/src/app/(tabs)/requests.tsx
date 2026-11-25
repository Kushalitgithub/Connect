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
import { Calendar, Clock, User, Check, X } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

type RequestType = {
  id: number;
  tour_listing: {
    id: number;
    title: string;
    price: number;
  };
  tourist: {
    id: number;
    email: string;
  };
  date: string;
  status: string;
  num_clients: number;
  created_at: string;
};

export default function GuideRequestsScreen() {
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<RequestType[]>('/guide/dashboard/bookings', {
        params: { status: 'pending' },
      });
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'accept' | 'decline') => {
    try {
      const targetStatus = action === 'accept' ? 'accepted' : 'declined';
      await api.put(`/guide/dashboard/bookings/${id}/status`, undefined, {
        params: { status: targetStatus },
      });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      Alert.alert('Failed to respond to request. Please try again.');
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
          <Text style={styles.title}>Booking Requests</Text>
          <Text style={styles.subtitle}>Review and respond to incoming tourist requests</Text>
        </View>

        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Pending Requests</Text>
              <Text style={styles.emptySubtitle}>You are all caught up for now!</Text>
            </View>
          ) : (
            requests.map((r) => (
              <View key={r.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.tourTitle}>{r.tour_listing.title}</Text>
                  <Text style={styles.price}>${r.tour_listing.price}</Text>
                </View>

                <View style={styles.detailRow}>
                  <User size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>Tourist: {r.tourist.email} ({r.num_clients} clients)</Text>
                </View>

                <View style={styles.detailRow}>
                  <Calendar size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{r.date}</Text>
                  <Clock size={14} color={colors.textSecondary} style={{ marginLeft: 10 }} />
                  <Text style={styles.detailText}>{new Date(r.created_at).toLocaleDateString()}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.btn, styles.declineBtn]}
                    onPress={() => handleAction(r.id, 'decline')}
                  >
                    <X size={16} color="#EF4444" />
                    <Text style={styles.declineText}>Decline</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.btn, styles.acceptBtn]}
                    onPress={() => handleAction(r.id, 'accept')}
                  >
                    <Check size={16} color="#FFFFFF" />
                    <Text style={styles.acceptText}>Accept Booking</Text>
                  </Pressable>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  listContent: { gap: 14 },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tourTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: 8 },
  price: { fontSize: 16, fontWeight: '800', color: colors.primary },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: colors.textSecondary },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  declineBtn: { borderWidth: 1, borderColor: '#EF4444' },
  declineText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
  acceptBtn: { backgroundColor: colors.primary },
  acceptText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
});
