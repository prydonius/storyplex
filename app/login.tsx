import React from "react";
import { PlexClient } from "../api/PlexClient";
import { useStore } from "../store";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Button, XStack, YStack, useTheme, H1 } from "tamagui";

export default function Login() {
  const setPlexAuthToken = useStore((state) => state.setPlexAuthToken);

  const handlePressButtonAsync = async () => {
    const authToken = await PlexClient.getPlexAuth();
    if (authToken) {
      setPlexAuthToken(authToken);
      router.push("/setup");
    }
  };

  const theme = useTheme();

  return (
    <YStack flex={1} alignItems="center" bc="$background">
      <XStack flex={1} mt="$20">
        <H1 color={theme.color12}>StoryPlex</H1>
      </XStack>
      <XStack flex={4}>
        <XStack elevation={5} height={200}>
          <Image
            source={require("../assets/icon.png")}
            style={{ width: 200, height: 200 }}
          />
        </XStack>
      </XStack>
      <XStack flex={1} mb="$10">
        <Button onPress={handlePressButtonAsync}>Login with Plex</Button>
      </XStack>
    </YStack>
  );
}
