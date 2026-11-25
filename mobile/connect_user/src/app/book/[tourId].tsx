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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Users, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

export default function BookingFlowScreen() {
  const router = useRouter();
  const { tourId } = useLocalSearchParams();

  const [tour, setTour] = useState<{
    id: number;
    title: string;
    description: string | null;
    price: number;
    capacity: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-step state: 1: Date -> 2: Duration -> 3: Clients -> 4: Summary -> 5: Booked
  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('Half Day (4h)');
  const [clientsCount, setClientsCount] = useState<number>(2);

  const durations = [
    { label: 'Half Day (4h)', pricePerPerson: 45 },
    { label: 'Full Day (8h)', pricePerPerson: 80 },
    { label: 'Multi-Day Trek', pricePerPerson: null },
  ];

  useEffect(() => {
    fetchTour();
  }, [tourId]);

  const fetchTour = async () => {
    try {
      const { data } = await api.get(`/bookings/tours`);
      const tours = Array.isArray(data) ? data : [];
      const found = tours.find((t: any) => String(t.id) === String(tourId));
      if (found) {
        setTour({
          id: found.id,
          title: found.title,
          description: found.description ?? null,
          price: found.price ?? 45,
          capacity: found.capacity ?? 5,
        });
      } else {
        setError('Tour not found');
      }
    } catch (err) {
      setError('Failed to load tour. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const pricePerPerson = durations.find((d) => d.label === selectedDuration)?.pricePerPerson ?? 45;
  const totalPrice = pricePerPerson ? pricePerPerson * clientsCount : null;

  const handleBook = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }
    setLoading(true);
    try {
      await api.post('/bookings/', undefined, {
        params: {
          tour_listing_id: Number(tourId),
          date: selectedDate,
          num_clients: clientsCount,
        },
      });
      setStep(5);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || 'Failed to request booking. Please try again.';
      setError(msg);
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

  if (error || !tour) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.empty}>
          <Text style={styles.errorText}>{error || 'Tour not found'}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              if (step > 1 && step < 5) setStep(step - 1);
              else router.back();
            }}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === 5 ? 'Booking Confirmed' : `Book Guide (Step ${step} of 4)`}
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STEP 1: Select Date */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Select Tour Date</Text>
              <Text style={styles.stepDesc}>Choose an available date</Text>

              <View style={styles.datesList}>
                {['2026-12-05', '2026-12-06', '2026-12-07', '2026-12-08', '2026-12-10'].map((d) => (
                  <Pressable
                    key={d}
                    style={[styles.dateOption, selectedDate === d && styles.activeDateOption]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Calendar size={18} color={selectedDate === d ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.dateText, selectedDate === d && styles.activeDateText]}>{d}</Text>
                    <Text style={styles.slotBadge}>Available</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={styles.nextBtn}
                onPress={() => setStep(2)}
                disabled={!selectedDate}
              >
                <Text style={styles.nextBtnText}>Continue to Duration</Text>
              </Pressable>
            </View>
          )}

          {/* STEP 2: Select Duration */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Select Duration</Text>
              <Text style={styles.stepDesc}>How long would you like the tour to last?</Text>

              <View style={styles.datesList}>
                {durations.map((dur) => (
                  <Pressable
                    key={dur.label}
                    style={[styles.dateOption, selectedDuration === dur.label && styles.activeDateOption]}
                    onPress={() => setSelectedDuration(dur.label)}
                  >
                    <Clock size={18} color={selectedDuration === dur.label ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.dateText, selectedDuration === dur.label && styles.activeDateText]}>
                      {dur.label}
                    </Text>
                    {dur.pricePerPerson ? (
                      <Text style={styles.priceTag}>${dur.pricePerPerson}/person</Text>
                    ) : (
                      <Text style={styles.priceTag}>Custom Quote</Text>
                    )}
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.nextBtn} onPress={() => setStep(3)}>
                <Text style={styles.nextBtnText}>Continue to Group Size</Text>
              </Pressable>
            </View>
          )}

          {/* STEP 3: Number of Clients */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Number of Clients</Text>
              <Text style={styles.stepDesc}>Select how many travelers will join the tour</Text>

              <View style={styles.counterBox}>
                <Pressable
                  style={styles.counterBtn}
                  onPress={() => setClientsCount(Math.max(1, clientsCount - 1))}
                >
                  <Text style={styles.counterBtnText}>-</Text>
                </Pressable>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.counterNumber}>{clientsCount}</Text>
                  <Text style={styles.counterLabel}>Travelers</Text>
                </View>
                <Pressable
                  style={styles.counterBtn}
                  onPress={() => setClientsCount(clientsCount + 1)}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </Pressable>
              </View>

              <Pressable style={styles.nextBtn} onPress={() => setStep(4)}>
                <Text style={styles.nextBtnText}>Review & Summary</Text>
              </Pressable>
            </View>
          )}

          {/* STEP 4: Final Booking Summary */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Booking Summary</Text>
              <Text style={styles.stepDesc}>Review your reservation details before requesting</Text>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tour:</Text>
                  <Text style={styles.summaryVal}>{tour.title}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Guide Price:</Text>
                  <Text style={styles.summaryVal}>${tour.price}/day</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date:</Text>
                  <Text style={styles.summaryVal}>{selectedDate}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration:</Text>
                  <Text style={styles.summaryVal}>{selectedDuration}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Group Size:</Text>
                  <Text style={styles.summaryVal}>{clientsCount} Travelers</Text>
                </View>
                {totalPrice && (
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Estimated Price:</Text>
                    <Text style={styles.totalPrice}>${totalPrice}</Text>
                  </View>
                )}
              </View>

              <Pressable style={styles.confirmBtn} onPress={handleBook} disabled={loading}>
                <Text style={styles.confirmBtnText}>{loading ? 'Requesting...' : 'Request Booking'}</Text>
              </Pressable>
            </View>
          )}

          {/* STEP 5: Booking Confirmed / Booked */}
          {step === 5 && (
            <View style={[styles.stepContainer, { alignItems: 'center', paddingVertical: 40 }]}>
              <CheckCircle2 size={72} color="#10B981" />
              <Text style={styles.bookedTitle}>Booking Requested!</Text>
              <Text style={styles.bookedDesc}>
                Your request has been sent to the guide. You will receive a notification once the guide accepts.
              </Text>
              <Pressable
                style={styles.doneBtn}
                onPress={() => router.push('/(tabs)/bookings' as any)}
              >
                <Text style={styles.doneBtnText}>View in My Bookings</Text>
              </Pressable>
            </View>
          )}

          <View style={{ height: 40 }} />
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
  scrollContent: { padding: 20 },
  stepContainer: { gap: 16 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  stepDesc: { fontSize: 14, color: colors.textSecondary, marginTop: -8 },
  datesList: { gap: 12, marginTop: 8 },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  activeDateOption: { borderColor: colors.primary, backgroundColor: '#FFF4ED' },
  dateText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  activeDateText: { color: colors.primary, fontWeight: '700' },
  slotBadge: { backgroundColor: '#ECFDF5', color: '#059669', fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priceTag: { fontSize: 13, fontWeight: '700', color: colors.primary },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 32,
    marginTop: 12,
  },
  counterBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  counterNumber: { fontSize: 36, fontWeight: '800', color: colors.textPrimary },
  counterLabel: { fontSize: 13, color: colors.textSecondary },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', gap: 12, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryVal: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  totalPrice: { fontSize: 20, fontWeight: '900', color: colors.primary },
  nextBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  bookedTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 16 },
  bookedDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: 20 },
  doneBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 24 },
  doneBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  backButton: { marginTop: 16 },
  backButtonText: { color: colors.primary, fontWeight: '600' },
  errorText: { color: '#991B1B', fontSize: 14, textAlign: 'center', marginBottom: 16 },
});
