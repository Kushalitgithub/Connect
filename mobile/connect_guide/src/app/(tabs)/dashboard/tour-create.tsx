import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../../../lib/design-system/tokens';
import { api } from '../../../../lib/api';

export default function TourCreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('45');
  const [capacity, setCapacity] = useState('6');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!title.trim() || !destination.trim()) {
      setError('Please fill in title and destination');
      return;
    }
    const priceNum = Number(price);
    const capacityNum = Number(capacity);
    if (!priceNum || priceNum <= 0) {
      setError('Price must be greater than zero');
      return;
    }
    if (!capacityNum || capacityNum <= 0) {
      setError('Capacity must be greater than zero');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/guide/dashboard/tours', undefined, {
        params: {
          title: title.trim(),
          description: `${destination.trim()} tour - ${destination}`,
          price: priceNum,
          capacity: capacityNum,
        },
      });
      setSaved(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to publish tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Create New Tour</Text>
          <View style={{ width: 22 }} />
        </View>

        {!saved ? (
          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Tour Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kathmandu Valley Secret Courtyards"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Destination / Area</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kathmandu, Patan, Bhaktapur"
              value={destination}
              onChangeText={setDestination}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Price per Guest ($)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Max Capacity</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={capacity}
                  onChangeText={setCapacity}
                />
              </View>
            </View>

            <Text style={styles.label}>Duration</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 4 Hours / Half Day"
              value={destination ? `${destination} tour duration` : '4 Hours'}
              editable={false}
            />

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable style={styles.submitBtn} onPress={handlePublish} disabled={loading}>
              <Text style={styles.submitBtnText}>{loading ? 'Publishing...' : 'Publish Tour Listing'}</Text>
            </Pressable>
          </ScrollView>
        ) : (
          <View style={styles.successBox}>
            <CheckCircle2 size={68} color="#10B981" />
            <Text style={styles.successTitle}>Tour Published!</Text>
            <Text style={styles.successDesc}>
              Tourists can now discover and book your tour on the Connect marketplace.
            </Text>
            <Pressable
              style={styles.doneBtn}
              onPress={() => router.push('/(tabs)/dashboard' as any)}
            >
              <Text style={styles.doneBtnText}>Back to Dashboard</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
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
  formContent: { padding: 20, gap: 14 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: -4 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: colors.textPrimary,
  },
  row: { flexDirection: 'row', gap: 12 },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 16 },
  successDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  doneBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 24 },
  doneBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
});
