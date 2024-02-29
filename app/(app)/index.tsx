import { Cog, RefreshCcw } from "@tamagui/lucide-icons";
import { useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { RefreshControl } from "react-native";
import { Button, H4, ScrollView, View, XStack, YStack } from "tamagui";
import { PlexAudiobook } from "../../api/PlexClient";
import AudiobookCard from "../../components/AudiobookCard";
import { usePlexClient } from "../../utils/PlexClientProvider";

export default function Home() {
  const [client, library] = usePlexClient();
  const [audiobooks, setAudiobooks] = useState<PlexAudiobook[]>();
  const [refreshing, setRefreshing] = useState<boolean>(true);

  const navigation = useNavigation();

  useEffect(() => {
    const getData = async () => {
      const audiobooks = await client.getAudiobooks(library.key);
      setAudiobooks(audiobooks);
      setRefreshing(false);
    };
    getData();
  }, [library, refreshing]);

  useLayoutEffect(() => {
    // navigation.setOptions({
    //   headerSearchBarOptions: {
    //     placeholder: "Search audiobooks...",
    //   },
    // headerRight: HeaderRight,
    // });
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <YStack padding="$3" gap="$5">
        <AudiobookSection title="Continue Reading" audiobooks={audiobooks} />
        <AudiobookSection title="Recently Added" audiobooks={audiobooks} />
      </YStack>
    </ScrollView>
  );
}

function HeaderRight() {
  return (
    <XStack gap="$2" paddingRight="$2">
      <Button size="$2" icon={Cog} scaleIcon={1.5} />
      <Button size="$2" icon={RefreshCcw} scaleIcon={1.5} />
    </XStack>
  );
}

interface AudiobookSectionProps {
  title: string;
  audiobooks: PlexAudiobook[] | undefined;
}
function AudiobookSection(props: AudiobookSectionProps) {
  return (
    <View gap="$2">
      <XStack>
        <H4>{props.title}</H4>
      </XStack>
      <XStack flexWrap="wrap" gap="$3">
        {props.audiobooks?.slice(0, 5).map((a) => {
          return (
            <AudiobookCard
              key={a.key}
              path={`/audiobook/${a.key}`}
              thumb={a.thumb}
            />
          );
        })}
      </XStack>
    </View>
  );
}
