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

interface BookingRequest {
  id: number;
  tourist_name: string;
  tourist_avatar: string | null;
  tour_title: string;
  date: string;
  status: string; // will be 'pending' for this screen
  created_at: string;
  message: string | null;
}

export default function RequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async (isRefresh = false) => {
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

      const response = await fetch('http://localhost:8000/api/v1/guide/dashboard/bookings?status_filter=pending', {
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
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      // Transform the data to match our interface
      const requestsData: BookingRequest[] = data.map((booking: any) => ({
        id: booking.id,
        tourist_name: booking.tourist_name || 'Unknown Tourist',
        tourist_avatar: null, // We don't have avatar in the current API, but we can add later
        tour_title: booking.tour_title,
        date: booking.date,
        status: booking.status,
        created_at: booking.created_at,
        message: null // We don't have a message field in the current booking model
      }));
      setRequests(requestsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
      console.error('Requests error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    fetchRequests(true);
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`http://localhost:8000/api/v1/guide/dashboard/bookings/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      // Refetch requests
      fetchRequests();
    } catch (err: any) {
      console.error('Error accepting request:', err);
      alert('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`http://localhost:8000/api/v1/guide/dashboard/bookings/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'declined' }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline request');
      }

      // Refetch requests
      fetchRequests();
    } catch (err: any) {
      console.error('Error declining request:', err);
      alert('Failed to decline request');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading requests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopStatusBar title="Requests" leftAction={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
            Error Loading Requests
          </Text>
          <Text style={{ marginTop: 8, color: colors.textSecondary, textAlign: 'center' }}>
            {error}
          </Text>
          <CustomButton onPress={() => fetchRequests()} title="Retry" style={{ marginTop: 20 }}>
            Retry
          </CustomButton>
        </View>
        <BottomNav />
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopStatusBar title="Requests" leftAction={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="calendar-clock" size={48} color={colors.textMuted} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            No pending requests
          </Text>
          <Text style={{ marginTop: 8, color: colors.textSecondary, textAlign: 'center' }}>
            You will see booking requests here when tourists want to book your tours.
          </Text>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopStatusBar title="Requests" leftAction={() => router.back()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
                    {item.tour_title}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                    {new Date(item.date).toLocaleString()}
                  </Text>
                  {item.message && (
                    <View style={{ marginTop: 8, padding: 12, backgroundColor: withOpacity(colors.primary, 0.1), borderRadius: 8 }}>
                      <Text style={{ fontSize: 14, color: colors.textPrimary }}>
                        {item.message}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
                      Requested
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ marginTop: 16, flexDirection: 'row', gap: 8 }}>
                <CustomButton
                  onPress={() => handleAcceptRequest(item.id)}
                  title="Accept"
                  style={{ flex: 1 }}
                >
                  Accept
                </CustomButton>
                <CustomButton
                  onPress={() => handleDeclineRequest(item.id)}
                  title="Decline"
                  style={{ flex: 1 }}
                >
                  Decline
                </CustomButton>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="calendar-clock" size={48} color={colors.textMuted} />
              <Text style={{ marginTop: 16, color: colors.textSecondary }}>
                No pending requests
              </Text>
            </View>
          }
        />
      </ScrollView>
      <BottomNav />
    </View>
  );
}
