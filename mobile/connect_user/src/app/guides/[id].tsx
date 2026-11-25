import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldCheck, Star, MapPin, Globe, Award, MessageSquare } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

export default function GuideProfileViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [guide, setGuide] = useState<{
    id: number;
    email: string;
    profile: { bio: string | null; verification_status: string | null; rating_avg: number | null; total_earnings: number | null; available_balance: number | null } | null;
    tours: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGuide();
  }, [id]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/bookings/guides/${Number(id)}`);
      setGuide(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load guide profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (!guide) return;
    router.push(`/chat/new?guideId=${guide.id}` as any);
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

  if (error || !guide) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>{error || 'Guide not found'}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isVerified = guide.profile?.verification_status === 'approved';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Guide Profile</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Header Card */}
          <View style={styles.profileCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }} style={styles.avatar} />
            <View style={styles.nameRow}>
              <Text style={styles.guideName}>{guide.email}</Text>
              {isVerified && <ShieldCheck size={20} color={colors.primary} />}
            </View>
            <View style={styles.locRow}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={styles.locText}>{guide.profile?.verification_status ?? 'pending'}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingScore}>{(guide.profile?.rating_avg ?? 0).toFixed(1)}</Text>
              <Text style={styles.reviewsCount}>({guide.tours.length} tours)</Text>
            </View>
          </View>

          {/* Bio Section */}
          {guide.profile?.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <Text style={styles.bioText}>{guide.profile.bio}</Text>
            </View>
          )}

          {/* Available Tours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tours Offered</Text>
            <View style={styles.toursList}>
              {guide.tours.map((t) => (
                <View key={t.id} style={styles.tourCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tourTitle}>{t.title}</Text>
                    <Text style={styles.tourDuration}>Capacity: {t.capacity}</Text>
                  </View>
                  <View style={styles.tourAction}>
                    <Text style={styles.tourPrice}>${t.price}</Text>
                    <Pressable
                      style={styles.bookBtn}
                      onPress={() => router.push(`/book/${t.id}` as any)}
                    >
                      <Text style={styles.bookBtnText}>Book Tour</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              {guide.tours.length === 0 && (
                <Text style={styles.emptyTours}>No active tours listed yet.</Text>
              )}
            </View>
          </View>

          <Pressable
            style={styles.messageBtn}
            onPress={handleMessage}
            disabled={!isVerified}
          >
            <MessageSquare size={16} color="#FFFFFF" />
            <Text style={styles.messageBtnText}>
              {isVerified ? 'Message Guide' : 'Guide not yet verified'}
            </Text>
          </Pressable>

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
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  scrollContent: { padding: 20, gap: 16 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideName: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locText: { fontSize: 13, color: colors.textSecondary },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  ratingScore: { fontSize: 13, fontWeight: '700', color: '#D97706' },
  reviewsCount: { fontSize: 12, color: colors.textSecondary },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  bioText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  toursList: { gap: 10, marginTop: 4 },
  tourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tourTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  tourDuration: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  tourAction: { alignItems: 'flex-end', gap: 4 },
  tourPrice: { fontSize: 15, fontWeight: '800', color: colors.primary },
  bookBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  bookBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  emptyTours: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 20 },
  messageBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    opacity: 1,
  },
  messageBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  errorText: { color: '#991B1B', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  backButton: { marginTop: 16 },
  backButtonText: { color: colors.primary, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
});
