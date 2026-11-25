import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../../../lib/design-system/tokens';
import { api } from '../../../../lib/api';

export default function ReviewSubmitScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();

  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submitted) return;
  }, [submitted]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.post('/reviews/', undefined, {
        params: {
          booking_id: Number(bookingId),
          rating,
          body: reviewText.trim() || undefined,
        },
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || 'Failed to submit review. Please try again.';
      setError(msg);
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
          <Text style={styles.headerTitle}>Leave a Review</Text>
          <View style={{ width: 22 }} />
        </View>

        {!submitted ? (
          <View style={styles.content}>
            <Text style={styles.title}>How was your tour experience?</Text>
            <Text style={styles.subtitle}>
              Your rating helps other travelers discover great local guides
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)} style={{ padding: 4 }}>
                  <Star
                    size={38}
                    color="#F59E0B"
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Your Feedback (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell others what you enjoyed most about your guide and tour..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>{loading ? 'Submitting...' : 'Submit Review'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.content, { alignItems: 'center', paddingTop: 60 }]}>
            <CheckCircle2 size={68} color="#10B981" />
            <Text style={styles.successTitle}>Review Submitted!</Text>
            <Text style={styles.successDesc}>
              Thank you for sharing your experience and supporting local guides in Nepal.
            </Text>
            <Pressable
              style={styles.doneBtn}
              onPress={() => router.push('/(tabs)/bookings' as any)}
            >
              <Text style={styles.doneBtnText}>Return to Bookings</Text>
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
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 24 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 28 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    height: 120,
    color: colors.textPrimary,
  },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  successTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 16 },
  successDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  doneBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 24 },
  doneBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
