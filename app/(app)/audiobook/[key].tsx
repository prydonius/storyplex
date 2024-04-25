import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, YStack } from "tamagui";
import { PlexAudiobook, PlexPlayQueue } from "../../../api/PlexClient";
import AudiobookDetails from "../../../components/AudiobookDetails";
import AudiobookPlayer from "../../../components/AudiobookPlayer";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { usePlexClient } from "../../../utils/PlexClientProvider";
import { useHeaderHeight } from "@react-navigation/elements";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../store";

export default function Audiobook() {
  const [client] = usePlexClient();
  const [updateAudiobook] = useStore(
    useShallow((state) => [state.updateAudiobook]),
  );
  const [audiobook, setAudiobook] = useState<PlexAudiobook>();
  const [queue, setQueue] = useState<PlexPlayQueue>();

  const headerHeight = useHeaderHeight();
  const { key } = useLocalSearchParams<{ key: string }>();
  const ratingKey = Number(key!);

  useEffect(() => {
    const getData = async () => {
      // start the queue
      const [queue, audiobook] = await client.queueAudiobook(ratingKey);
      setAudiobook(audiobook);
      updateAudiobook(audiobook);
      setQueue(queue);
    };
    getData();
  }, []);

  return (
    <LoadingSpinner isLoading={!audiobook || !queue} backgroundColor="$purple1">
      <ScrollView backgroundColor="$purple1">
        <YStack flex={1} padding="$5" maxWidth={550} mt={headerHeight}>
          <AudiobookDetails audiobook={audiobook!} />
          <AudiobookPlayer audiobook={audiobook!} queue={queue!} />
        </YStack>
      </ScrollView>
    </LoadingSpinner>
  );
}
