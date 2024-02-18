import { AlertTriangle } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

const Libraries: React.FC = () => {
  const [plexAuthToken, conn, setPlexLibrary] = useStore(
    useShallow((state) => [
      state.authToken,
      state.plexConnection,
      state.setPlexLibrary,
    ]),
  );
  const [libraries, setLibraries] = useState<PlexLibrary[]>();

  useEffect(() => {
    if (!conn?.serverName || !plexAuthToken) {
      return;
    }

    const getData = async () => {
      const client = new PlexClient(plexAuthToken, conn.serverUri);
      const response = await client.getLibraries();
      setLibraries(response);
    };
    getData();
  }, [plexAuthToken, conn]);

  const handleLibraryListPress = async (library: PlexLibrary) => {
    setPlexLibrary(library);
    router.push("/");
  };

  const theme = useTheme();

  return (
    <YStack flex={1} alignItems="center" bc="$background">
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
        </YGroup>
      </XStack>
    </YStack>
  );
};

export default Libraries;
