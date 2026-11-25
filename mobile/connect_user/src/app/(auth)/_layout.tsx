import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <Stack>
      <StatusBar style="light" />
      {/* Login and signup screens are defined in their respective directories */}
    </Stack>
  );
}