import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopStatusBar } from '../../../lib/design-system/TopStatusBar';
import { BottomNav } from '../../../lib/design-system/BottomNav';
import { Card } from '../../../lib/design-system/Card';
import { StatusChip } from '../../../lib/design-system/StatusChip';
import { colors, withOpacity } from '../../../lib/design-system/tokens';
import { Button as CustomButton } from '../../../lib/design-system/Button';

interface WithdrawalHistoryItem {
  id: number;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: string | null;
  processed_at: string | null;
  failed_reason: string | null;
  created_at: string;
  updated_at: string;
}

export default function WithdrawalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');

  const fetchWithdrawalData = async (isRefresh = false) => {
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

      // Fetch guide profile to get available balance
      const profileResponse = await fetch('http://localhost:8000/api/v1/guide/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch guide profile');
      }

      const profileData = await profileResponse.json();
      setBalance(profileData.available_balance || 0);

      // Fetch withdrawal history
      const historyResponse = await fetch('http://localhost:8000/api/v1/guide/dashboard/withdrawal/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!historyResponse.ok) {
        throw new Error('Failed to fetch withdrawal history');
      }

      const historyData = await historyResponse.json();
      setWithdrawalHistory(historyData);
    } catch (err: any) {
      setError(err.message || 'Failed to load withdrawal data');
      console.error('Withdrawal error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (parseFloat(withdrawalAmount) > balance) {
      setError('Insufficient balance for withdrawal');
      return;
    }

    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:8000/api/v1/guide/dashboard/withdrawal/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          payment_method: paymentMethod,
          payment_details: paymentDetails || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to request withdrawal');
      }

      // Reset form and refresh data
      setWithdrawalAmount('');
      setPaymentMethod('');
      setPaymentDetails('');
      await fetchWithdrawalData();

      // Show success message (in a real app, you'd use a toast or similar)
      alert('Withdrawal request submitted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to request withdrawal');
      console.error('Withdrawal request error:', err);
    }
  };

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const onRefresh = () => {
    fetchWithdrawalData(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.info;
      case 'completed':
        return colors.success;
      case 'failed':
        return colors.error;
      case 'cancelled':
        return colors.textMuted;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading withdrawal data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopStatusBar title="Withdrawal" leftAction={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
            Error Loading Data
          </Text>
          <Text style={{ marginTop: 8, color: colors.textSecondary, textAlign: 'center' }}>
            {error}
          </Text>
          <CustomButton onPress={() => fetchWithdrawalData()} title="Retry" style={{ marginTop: 20 }}>
            Retry
          </CustomButton>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopStatusBar title="Withdrawal" leftAction={() => router.back()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 }}>
            Available Balance
          </Text>
          <Card style={{ padding: 20, backgroundColor: withOpacity(colors.primary, 0.1), borderColor: colors.primary, borderWidth: 2 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, textAlign: 'center' }}>
              ${balance.toFixed(2)}
            </Text>
          </Card>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>
            Request Withdrawal
          </Text>
          <Card style={{ padding: 20 }}>
            <TextInput
              placeholder="Enter withdrawal amount"
              keyboardType="numeric"
              value={withdrawalAmount}
              onChangeText={setWithdrawalAmount}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
              }}
            />
            <TextInput
              placeholder="Payment method (e.g., bank_transfer, paypal)"
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
              }}
            />
            <TextInput
              placeholder="Payment details (account info, etc.)"
              value={paymentDetails}
              onChangeText={setPaymentDetails}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
              }}
            />
            <CustomButton
              onPress={handleRequestWithdrawal}
              title="Request Withdrawal"
              style={{ marginTop: 8 }}
            >
              Request Withdrawal
            </CustomButton>
          </Card>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>
            Withdrawal History
          </Text>
          {withdrawalHistory.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="history" size={48} color={colors.textMuted} />
              <Text style={{ marginTop: 16, color: colors.textSecondary }}>
                No withdrawal history yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={withdrawalHistory}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Card style={{ marginBottom: 12, padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
                        ${item.amount}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                        {item.payment_method}
                      </Text>
                      <StatusChip status={item.status.toLowerCase() as any} style={{ marginTop: 4 }}>
                        {item.status.toUpperCase()}
                      </StatusChip>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  {item.failed_reason && (
                    <View style={{ marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <Text style={{ fontSize: 14, color: colors.error }}>
                        Failed: {item.failed_reason}
                      </Text>
                    </View>
                  )}
                </Card>
              )}
              ListEmptyComponent={
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted }}>No withdrawal history found</Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}