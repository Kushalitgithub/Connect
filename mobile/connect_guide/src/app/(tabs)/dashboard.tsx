import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopStatusBar } from '../../lib/design-system/TopStatusBar';
import { BottomNav } from '../../lib/design-system/BottomNav';
import { Button as CustomButton } from '../../lib/design-system/Button';
import { Card } from '../../lib/design-system/Card';
import { StatusChip } from '../../lib/design-system/StatusChip';
import { colors, withOpacity } from '../../lib/design-system/tokens';

interface DashboardStats {
  pending_requests: number;
  confirmed_bookings: number;
  total_earnings: number;
  total_tours: number;
  last_updated: string;
}

interface TourItem {
  id: number;
  title: string;
  description: string | null;
  price: number;
  capacity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface BookingItem {
  id: number;
  tourist_name: string;
  date: string;
  status: string;
  created_at: string;
  tour_title: string;
}

interface DailyEarning {
  date: string;
  earnings: number;
  tour_count: number;
}

interface EarningsData {
  period_days: number;
  total_earnings: number;
  completed_tours: number;
  average_per_tour: number;
  daily_breakdown: DailyEarning[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tours, setTours] = useState<TourItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'bookings' | 'earnings'>('overview');

  const fetchDashboardData = async (isRefresh = false) => {
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

      // Fetch dashboard overview
      const overviewResponse = await fetch('http://localhost:8000/api/v1/guide/dashboard/overview', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!overviewResponse.ok) {
        if (overviewResponse.status === 401) {
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch dashboard overview');
      }

      const overviewData = await overviewResponse.json();
      setStats(overviewData);

      // Fetch tours
      const toursResponse = await fetch('http://localhost:8000/api/v1/guide/dashboard/tours', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!toursResponse.ok) {
        throw new Error('Failed to fetch tours');
      }

      const toursData = await toursResponse.json();
      setTours(toursData);

      // Fetch bookings
      const bookingsResponse = await fetch('http://localhost:8000/api/v1/guide/dashboard/bookings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!bookingsResponse.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData);

      // Fetch earnings
      const earningsResponse = await fetch('http://localhost:8000/api/v1/guide/dashboard/earnings?days=30', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!earningsResponse.ok) {
        throw new Error('Failed to fetch earnings');
      }

      const earningsData = await earningsResponse.json();
      setEarningsData(earningsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return colors.pending;
      case 'accepted':
        return colors.statusChipText.accepted;
      case 'declined':
        return colors.error;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.textMuted;
      default:
        return colors.textSecondary;
    }
  };

  const renderOverviewStats = () => {
    if (!stats) return null;

    return (
      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
          <Card style={{ width: '48%', backgroundColor: withOpacity(colors.primary, 0.1), borderColor: colors.primary, borderWidth: 1 }}>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>Pending Requests</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
              {stats.pending_requests}
            </Text>
          </Card>

          <Card style={{ width: '48%', backgroundColor: withOpacity(colors.statusChipText.accepted, 0.1), borderColor: colors.statusChipText.accepted, borderWidth: 1 }}>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>Confirmed Bookings</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.statusChipText.accepted }}>
              {stats.confirmed_bookings}
            </Text>
          </Card>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Card style={{ width: '48%', backgroundColor: withOpacity(colors.primary, 0.1), borderColor: colors.primary, borderWidth: 1 }}>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>Total Earnings</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
              ${stats.total_earnings.toFixed(2)}
            </Text>
          </Card>

          <Card style={{ width: '48%', backgroundColor: withOpacity(colors.primary, 0.1), borderColor: colors.primary, borderWidth: 1 }}>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>Total Tours</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
              {stats.total_tours}
            </Text>
          </Card>
        </View>

        {stats.last_updated && (
          <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
              Last updated: {new Date(stats.last_updated).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderToursList = () => {
    if (tours.length === 0) {
      return (
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="map-marker-radius" size={48} color={colors.textMuted} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            No tours created yet
          </Text>
          <CustomButton
            onPress={() => router.push('/(tabs)/dashboard/tour-create')}
            title="Create Your First Tour"
            style={{ marginTop: 12 }}
          >
            Create Tour
          </CustomButton>
        </View>
      );
    }

    return (
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
                  {item.title}
                </Text>
                {item.description && (
                  <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 }}>
                    {item.description}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    ${item.price}/person
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {item.capacity} spots
                  </Text>
                  <StatusChip
                    status={item.active ? 'accepted' : 'cancelled'}
                    style={{ marginTop: 4 }}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </StatusChip>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <MaterialCommunityIcons name="pencil" size={24} color={colors.primary} style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 12, color: colors.textMuted }} onPress={() => router.push(`/tabs/dashboard/tour-edit/${item.id}`)}>
                  Edit
                </Text>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="map-marker-radius" size={48} color={colors.textMuted} />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>
              No tours found
            </Text>
          </View>
        }
      />
    );
  };

  const renderBookingsList = () => {
    if (bookings.length === 0) {
      return (
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="calendar-clock" size={48} color={colors.textMuted} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            No bookings yet
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
                  {item.tour_title}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                  With: {item.tourist_name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                  Date: {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <StatusChip
                  status={item.status.toLowerCase() as any}
                  style={{ marginBottom: 8 }}
                >
                  {item.status.toUpperCase()}
                </StatusChip>
              </View>
            </View>
            {item.status.toLowerCase() === 'pending' && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <CustomButton
                  onPress={() => console.log('Accept booking:', item.id)}
                  title="Accept"
                  style={{ flex: 1 }}
                >
                  Accept
                </CustomButton>
                <CustomButton
                  onPress={() => console.log('Decline booking:', item.id)}
                  title="Decline"
                  style={{ flex: 1 }}
                >
                  Decline
                </CustomButton>
              </View>
            )}
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="calendar-clock" size={48} color={colors.textMuted} />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>
              No bookings found
            </Text>
          </View>
        }
      />
    );
  };

  const renderEarningsSection = () => {
    if (!earningsData) return null;

    return (
      <View style={{ marginBottom: 24 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
            Earnings Overview ({earningsData.period_days} days)
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Card style={{ width: '32%', backgroundColor: withOpacity(colors.primary, 0.1), borderColor: colors.primary, borderWidth: 1 }}>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>Total Earnings</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
                ${earningsData.total_earnings.toFixed(2)}
              </Text>
            </Card>

            <Card style={{ width: '32%', backgroundColor: withOpacity(colors.primary, 0.1), borderColor: colors.primary, borderWidth: 1 }}>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>Completed Tours</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
                {earningsData.completed_tours}
              </Text>
            </Card>

            <Card style={{ width: '32%', backgroundColor: withOpacity(colors.primary, 0.1), borderColor: colors.primary, borderWidth: 1 }}>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>Avg. Per Tour</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
                ${earningsData.average_per_tour.toFixed(2)}
              </Text>
            </Card>
          </View>
        </View>

        {earningsData.daily_breakdown.length > 0 && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
              Daily Earnings
            </Text>
            <FlatList
              data={earningsData.daily_breakdown.slice(0, 7)} // Show last 7 days
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => (
                <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialCommunityIcons name="currency-usd" size={16} color={colors.primary} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                        ${item.earnings.toFixed(2)}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>({item.tour_count} tours)</Text>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted }}>No daily earnings data</Text>
                </View>
              }
            />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopStatusBar title="Dashboard" leftAction={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
            Error Loading Dashboard
          </Text>
          <Text style={{ marginTop: 8, color: colors.textSecondary, textAlign: 'center' }}>
            {error}
          </Text>
          <Button onPress={() => fetchDashboardData()} title="Retry" style={{ marginTop: 20 }}>
            Retry
          </Button>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopStatusBar title="Dashboard" leftAction={() => router.back()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {activeTab === 'overview' && (
          <>
            {renderOverviewStats()}
            {stats && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>
                  Quick Actions
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  <CustomButton
                    onPress={() => router.push('/(tabs)/dashboard/tour-create')}
                    title="Create Tour"
                    style={{ flex: 1 }}
                  >
                    Create Tour
                  </CustomButton>
                  <CustomButton
                    onPress={() => router.push('/(tabs)/requests')}
                    title="Manage Requests"
                    style={{ flex: 1 }}
                  >
                    Manage Requests
                  </CustomButton>
                  <CustomButton
                    onPress={() => router.push('/(tabs)/bookings')}
                    title="View Bookings"
                    style={{ flex: 1 }}
                  >
                    View Bookings
                  </CustomButton>
                </View>
              </View>
            )}
          </>
        )}
        {activeTab === 'tours' && renderToursList()}
        {activeTab === 'bookings' && renderBookingsList()}
        {activeTab === 'earnings' && renderEarningsSection()}
      </ScrollView>
      <View style={{ position: 'absolute', bottom: 80, left: 0, right: 0, padding: 0, margin: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activeTab === 'overview' ? colors.primary : colors.border,
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activeTab === 'tours' ? colors.primary : colors.border,
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activeTab === 'bookings' ? colors.primary : colors.border,
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activeTab === 'earnings' ? colors.primary : colors.border,
            }}
          />
        </View>
      </View>
      <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, height: 40, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderRightWidth: activeTab !== 'overview' ? 1 : 0,
            borderRightColor: colors.border,
          }}
          onPress={() => setActiveTab('overview')}
        >
          <MaterialCommunityIcons name="home-variant" size={20} color={activeTab === 'overview' ? colors.primary : colors.textSecondary} />
          <Text style={{ fontSize: 12, color: activeTab === 'overview' ? colors.primary : colors.textSecondary, marginTop: 2 }}>
            Overview
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderRightWidth: activeTab !== 'tours' ? 1 : 0,
            borderRightColor: colors.border,
          }}
          onPress={() => setActiveTab('tours')}
        >
          <MaterialCommunityIcons name="map-marker-radius" size={20} color={activeTab === 'tours' ? colors.primary : colors.textSecondary} />
          <Text style={{ fontSize: 12, color: activeTab === 'tours' ? colors.primary : colors.textSecondary, marginTop: 2 }}>
            Tours
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderRightWidth: activeTab !== 'bookings' ? 1 : 0,
            borderRightColor: colors.border,
          }}
          onPress={() => setActiveTab('bookings')}
        >
          <MaterialCommunityIcons name="calendar-check" size={20} color={activeTab === 'bookings' ? colors.primary : colors.textSecondary} />
          <Text style={{ fontSize: 12, color: activeTab === 'bookings' ? colors.primary : colors.textSecondary, marginTop: 2 }}>
            Bookings
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setActiveTab('earnings')}
        >
          <MaterialCommunityIcons name="cash" size={20} color={activeTab === 'earnings' ? colors.primary : colors.textSecondary} />
          <Text style={{ fontSize: 12, color: activeTab === 'earnings' ? colors.primary : colors.textSecondary, marginTop: 2 }}>
            Earnings
          </Text>
        </View>
      </View>
      <BottomNav />
    </View>
  );
}
