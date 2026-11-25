import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export function RootLayout() {
  return (
    <Stack>
      <StatusBar style="light" />
    </Stack>
  );
}

export default RootLayout;