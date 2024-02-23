import { AlertTriangle } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Button,
  H1,
  ListItem,
  Paragraph,
  Separator,
  Tooltip,
  XStack,
  YGroup,
  YStack,
  useTheme,
} from "tamagui";
import { useShallow } from "zustand/react/shallow";
import { PlexClient, PlexLibrary } from "../api/PlexClient";
import { useStore } from "../store";
import LoadingSpinner from "../components/LoadingSpinner";

const Libraries: React.FC = () => {
  const [plexAuthToken, conn, setPlexLibrary] = useStore(
    useShallow((state) => [
      state.authToken,
      state.plexConnection,
      state.setPlexLibrary,
    ]),
  );
  const [libraries, setLibraries] = useState<PlexLibrary[]>();
  const [isLoading, setLoading] = useState<boolean>(true);

  const getData = async () => {
    if (!conn?.serverName || !plexAuthToken) {
      return;
    }
    // using the server access token for the PMS API
    const client = new PlexClient(conn.serverAccessToken, conn.serverUri);
    const response = await client.getLibraries();
    setLibraries(response);
    setLoading(false);
  };
  useEffect(() => {
    getData();
  }, [plexAuthToken, conn]);

  const handleLibraryListPress = async (library: PlexLibrary) => {
    setPlexLibrary(library);
    router.push("/");
  };

  const theme = useTheme();

  return (
    <YStack flex={1} alignItems="center" bc="$background">
      <LoadingSpinner isLoading={isLoading}>
        <XStack flex={1} mt="$20">
          <H1 color={theme.color12}>StoryPlex</H1>
        </XStack>
        <XStack flex={3} mb="$10" alignItems="stretch" alignSelf="stretch">
          <YGroup flex={1} size="$0">
            {libraries?.map((lib) => {
              return (
                <YGroup.Item key={lib.key}>
                  <Separator />
                  <ListItem
                    onPress={() => {
                      if (lib.supported) handleLibraryListPress(lib);
                    }}
                    hoverTheme={lib.supported}
                    pressTheme={lib.supported}
                    title={lib.title}
                    subTitle={lib.path}
                    icon={
                      lib.supported ? null : (
                        <Tooltip placement="bottom-start">
                          <Tooltip.Trigger>
                            <AlertTriangle />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <Tooltip.Arrow />
                            <Paragraph size="$2">
                              Must be a music library with the Audnexus agent
                            </Paragraph>
                          </Tooltip.Content>
                        </Tooltip>
                      )
                    }
                  />
                  <Separator />
                </YGroup.Item>
              );
            })}
            {!libraries && <Button onPress={getData}>Refetch Libraries</Button>}
          </YGroup>
        </XStack>
      </LoadingSpinner>
    </YStack>
  );
};

export default Libraries;
