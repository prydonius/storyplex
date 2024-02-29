import React, { useState, useEffect } from "react";
import { PlexClient, PlexServer } from "../api/PlexClient";
import { useStore } from "../store";
import { router } from "expo-router";
import {
  XStack,
  YStack,
  useTheme,
  H1,
  Separator,
  YGroup,
  ListItem,
} from "tamagui";
import { useShallow } from "zustand/react/shallow";

export default function Setup() {
  const [plexAuthToken, setPlexServer] = useStore(
    useShallow((state) => [state.authToken, state.setPlexServer]),
  );
  const [plexServers, setPlexServers] = useState<PlexServer[]>([]);

  useEffect(() => {
    const getData = async () => {
      if (plexAuthToken !== undefined) {
        // using the Plex auth token for the Plex.tv API
        const client = new PlexClient(plexAuthToken);
        const servers = await client.getPlexServers();
        setPlexServers(servers);
      }
    };
    getData();
  }, [plexAuthToken]);

  const handleServerListPress = async (name: string) => {
    const server = plexServers.find((s) => s.name == name);
    setPlexServer(name, server!.uri, server!.accessToken);
    router.push("/libraries");
  };

  const theme = useTheme();

  return (
    <YStack flex={1} alignItems="center" bc="$background">
      <XStack flex={1} mt="$20">
        <H1 color={theme.color12}>StoryPlex</H1>
      </XStack>
      <XStack flex={3} mb="$10" alignSelf="stretch" alignItems="stretch">
        <YGroup flex={1} size="$0">
          {plexServers.map((server) => {
            return (
              <YGroup.Item key={server.name}>
                <Separator />
                <ListItem
                  onPress={() => {
                    handleServerListPress(server.name);
                  }}
                  hoverTheme
                  pressTheme
                  title={server.name}
                  subTitle={server.ip}
                />
                <Separator />
              </YGroup.Item>
            );
          })}
        </YGroup>
      </XStack>
    </YStack>
  );
}
