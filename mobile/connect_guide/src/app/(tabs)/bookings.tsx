import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopStatusBar } from '../../../lib/design-system/TopStatusBar';
import { BottomNav } from '../../../lib/design-system/BottomNav';
import { Button as CustomButton } from '../../../lib/design-system/Button';
import { Card } from '../../../lib/design-system/Card';
import { StatusChip } from '../../../lib/design-system/StatusChip';
import { colors, withOpacity } from '../../../lib/design-system/tokens';

interface BookingItem {
  id: number;
  tourist_id: number;
  tour_listing_id: number;
  date: string;
  status: string;
  created_at: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const url = filterStatus
        ? `http://localhost:8000/api/v1/guide/dashboard/bookings?status_filter=${filterStatus}`
        : 'http://localhost:8000/api/v1/guide/dashboard/bookings';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
      console.error('Bookings error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const onRefresh = () => {
    fetchBookings(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'accepted':
        return 'accepted';
      case 'declined':
        return 'rejected';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const renderFilterButtons = () => {
    const filters = [
      { label: 'All', value: null },
      { label: 'Pending', value: 'pending' },
      { label: 'Accepted', value: 'accepted' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {filters.map((filter) => (
            <CustomButton
              key={filter.label}
              onPress={() => setFilterStatus(filter.value)}
              style={{
                backgroundColor: filterStatus === filter.value ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={{
                color: filterStatus === filter.value ? colors.surface : colors.textPrimary,
                fontSize: 14,
                fontWeight: '600'
              }}>
                {filter.label}
              </Text>
            </CustomButton>
          ))}
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopStatusBar title="Bookings" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
            Error Loading Bookings
          </Text>
          <Text style={{ marginTop: 8, color: colors.textSecondary, textAlign: 'center' }}>
            {error}
          </Text>
          <CustomButton onPress={() => fetchBookings()} title="Retry" style={{ marginTop: 20 }}>
            Retry
          </CustomButton>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopStatusBar title="Bookings" />
      <View style={{ flex: 1, padding: 20 }}>
        {renderFilterButtons()}

        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {bookings.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.textMuted} />
              <Text style={{ marginTop: 16, color: colors.textSecondary }}>
                {filterStatus ? `No ${filterStatus} bookings` : 'No bookings yet'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Card style={{ marginBottom: 12, padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
                        Booking #{item.id}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                        Tour ID: {item.tour_listing_id}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                        Date: {new Date(item.date).toLocaleString()}
                      </Text>
                      <StatusChip status={getStatusColor(item.status) as any}>
                        {item.status.toUpperCase()}
                      </StatusChip>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        Created
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}
            />
          )}
        </ScrollView>
      </View>
      <BottomNav />
    </View>
  );
}
