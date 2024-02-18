import React, { useEffect, useState } from "react";
import { H2, ScrollView, XStack, YStack } from "tamagui";
import { PlexAudiobook } from "../../api/PlexClient";
import { usePlexClient } from "../../utils/PlexClientProvider";
import AudiobookCard from "../../components/AudiobookCard";
import LoadingSpinner from "../../components/LoadingSpinner";

const Home: React.FC = () => {
  const [client, library] = usePlexClient();
  const [audiobooks, setAudiobooks] = useState<PlexAudiobook[]>();

  useEffect(() => {
    const getData = async () => {
      const audiobooks = await client.getAudiobooks(library.key);
      setAudiobooks(audiobooks);
    };
    getData();
  }, [library]);

  return (
    <YStack flex={1}>
      <XStack padding="$5" paddingBottom="$0">
        <H2>Audiobooks</H2>
      </XStack>
      <LoadingSpinner isLoading={!audiobooks}>
        <ScrollView>
          <XStack flex={1} padding="$5" gap="$3" flexWrap="wrap">
            {audiobooks?.map((a) => {
              return (
                <AudiobookCard
                  key={a.key}
                  path={`/audiobook/${a.key}`}
                  thumb={a.thumb}
                />
              );
            })}
          </XStack>
        </ScrollView>
      </LoadingSpinner>
    </YStack>
  );
};

export default Home;
