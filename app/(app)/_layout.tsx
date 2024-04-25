import { Stack } from "expo-router";
import { PlexClientProvider } from "../../utils/PlexClientProvider";
import { useTheme } from "tamagui";

export default function Layout() {
  const theme = useTheme();
  return (
    <PlexClientProvider>
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerTintColor: theme.purple11.get(),
          headerBackTitle: "Home",
        }}
      >
        <Stack.Screen name="index" options={{ title: "StoryPlex" }} />
        <Stack.Screen
          name="tag/[key]"
          options={({ route }) => ({ title: route.params.key })}
        />
        <Stack.Screen name="audiobook/[key]" options={{ title: "" }} />
      </Stack>
    </PlexClientProvider>
  );
}
