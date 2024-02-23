import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { XStack, YStack } from "tamagui";
import { PlexAudiobook, PlexPlayQueue } from "../../../api/PlexClient";
import AudiobookDetails from "../../../components/AudiobookDetails";
import AudiobookPlayer from "../../../components/AudiobookPlayer";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { usePlexClient } from "../../../utils/PlexClientProvider";

export default function Audiobook() {
  const [client] = usePlexClient();
  const [audiobook, setAudiobook] = useState<PlexAudiobook>();
  const [queue, setQueue] = useState<PlexPlayQueue>();

  const { key } = useLocalSearchParams<{ key: string }>();
  const ratingKey = Number(key!);

  useEffect(() => {
    const getData = async () => {
      // start the queue
      const [queue, audiobook] = await client.queueAudiobook(ratingKey);
      setAudiobook(audiobook);
      setQueue(queue);
    };
    getData();
  }, []);

  return (
    <>
      {/* <Stack.Screen options={{ title: audiobook.title }} /> */}
      <YStack flex={1} padding="$5" maxWidth={550}>
        <LoadingSpinner isLoading={!audiobook || !queue}>
          <AudiobookDetails audiobook={audiobook!} />
          <XStack alignSelf="center">{/* <H6>{chapter?.tag}</H6> */}</XStack>
          <AudiobookPlayer audiobook={audiobook!} queue={queue!} />
        </LoadingSpinner>
      </YStack>
    </>
  );
}