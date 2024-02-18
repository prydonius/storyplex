import { Stack } from "expo-router";
import { PlexClientProvider } from "../../utils/PlexClientProvider";

export default function Layout() {
  return (
    <PlexClientProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Home", headerShown: false }}
        />
        <Stack.Screen name="audiobook/[key]" options={{ title: "" }} />
      </Stack>
    </PlexClientProvider>
  );
}
