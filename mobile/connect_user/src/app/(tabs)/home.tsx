import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Star, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

export default function TouristHomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [tours, setTours] = useState<TourType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/tours', { params: { limit: 50 } });
      const normalized = (data as any[]).map((t) => ({
        id: String(t.id),
        title: t.title,
        subtitle: t.description ? t.description.slice(0, 40) : '',
        price: `$${t.price}/day`,
        capacity: t.capacity,
        image: t.guide?.image ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        guideName: t.guide?.name ?? 'Local Guide',
        rating: t.guide?.rating ?? 4.9,
        verified: t.guide?.verification_status === 'approved',
      }));
      setTours(normalized);
    } catch (err) {
      setError('Failed to load tours. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const visibleTours = tours.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Header / Brand */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>Connect</Text>
            <Text style={styles.brandSubtitle}>Explore Nepal with Verified Local Guides</Text>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable style={styles.searchBar}>
          <Search size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations, cities, or activities..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Pressable>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Destinations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Tours</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationsRow}>
          {visibleTours.map((tour) => (
            <Pressable
              key={tour.id}
              style={styles.destCard}
              onPress={() => router.push({ pathname: '/(tabs)/guide', params: { tourId: tour.id } } as any)}
            >
              <Image source={{ uri: tour.image }} style={styles.destImage} />
              <View style={styles.destOverlay}>
                <Text style={styles.destCardTitle}>{tour.title}</Text>
                <Text style={styles.destCardSubtitle}>{tour.price}</Text>
              </View>
            </Pressable>
          ))}
          {visibleTours.length === 0 && !loading && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tours found</Text>
            </View>
          )}
        </ScrollView>

        {/* Verified Local Guides section link */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Local Guides</Text>
          <Pressable onPress={() => router.push('/(tabs)/guide' as any)}>
            <Text style={styles.seeAllText}>Explore</Text>
          </Pressable>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

type TourType = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  capacity: number;
  image: string;
  guideName: string;
  rating: number;
  verified: boolean;
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  header: { marginBottom: 20 },
  brandTitle: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  brandSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  seeAllText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  destinationsRow: { gap: 14, paddingBottom: 24 },
  destCard: { width: 200, height: 140, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  destImage: { width: '100%', height: '100%' },
  destOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  destCardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  destCardSubtitle: { color: '#E5E7EB', fontSize: 12 },
  emptyCard: { width: 200, height: 140, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  emptyText: { color: colors.textSecondary, fontSize: 13 },
});
