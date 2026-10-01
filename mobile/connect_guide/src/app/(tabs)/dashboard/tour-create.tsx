import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopStatusBar } from '../../lib/design-system/TopStatusBar';
import { BottomNav } from '../../lib/design-system/BottomNav';
import { Input } from '../../lib/design-system/Input';
import { Button as CustomButton } from '../../lib/design-system/Button';
import { colors } from '../../lib/design-system/tokens';

export default function TourCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTour = async () => {
    if (!title || !price || !capacity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const priceNum = parseFloat(price);
    const capacityNum = parseInt(capacity, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price greater than zero');
      return;
    }

    if (isNaN(capacityNum) || capacityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid capacity greater than zero');
      return;
    }

    setLoading(true);
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (!accessToken) {
        Alert.alert('Error', 'Not authenticated. Please login again.');
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/guide/dashboard/tours', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          itinerary: itinerary || null,
          price: priceNum,
          capacity: capacityNum,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create tour');
      }

      const data = await response.json();
      Alert.alert('Success', 'Tour created successfully');
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create tour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
      <TopStatusBar title="Create Tour" leftAction={() => router.back()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 }}>
          Create New Tour
        </Text>

        <Input
          label="Tour Title"
          placeholder="Enter tour title"
          value={title}
          onChangeText={setTitle}
          className="mb-4"
        />

        <Input
          label="Description"
          placeholder="Enter tour description"
          value={description}
          onChangeText={setDescription}
          className="mb-4"
          multiline
          minHeight={80}
        />

        <Input
          label="Itinerary"
          placeholder="Enter tour itinerary"
          value={itinerary}
          onChangeText={setItinerary}
          className="mb-4"
          multiline
          minHeight={80}
        />

        <Input
          label="Price (per person)"
          placeholder="Enter price"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          className="mb-4"
        />

        <Input
          label="Capacity"
          placeholder="Enter maximum number of tourists"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
          className="mb-4"
        />

        <CustomButton
          title={loading ? 'Creating Tour...' : 'Create Tour'}
          onPress={handleCreateTour}
          disabled={loading}
          className="mb-4"
        >
          {loading ? 'Creating Tour...' : 'Create Tour'}
        </CustomButton>
      </ScrollView>
      <BottomNav />
    </View>
  );
}
