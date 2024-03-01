import { Cog, RefreshCcw } from "@tamagui/lucide-icons";
import { useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { RefreshControl } from "react-native-web-refresh-control";
import { Button, ScrollView, XStack, YStack, Text, useTheme } from "tamagui";
import { PlexAudiobook } from "../../api/PlexClient";
import { AudiobookCardFooterType } from "../../components/AudiobookCard";
import { usePlexClient } from "../../utils/PlexClientProvider";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { AudiobookSection } from "../../components/AudiobookSection";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  NativeSyntheticEvent,
  Platform,
  TextInputFocusEventData,
} from "react-native";

export default function Home() {
  const [client, library] = usePlexClient();
  const [audiobooks, setAudiobooks] = useStore(
    useShallow((state) => [state.audiobooks, state.setAudiobooks]),
  );
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();

  const getData = useCallback(async () => {
    const audiobooks = await client.getAudiobooks(library.key);
    setAudiobooks(audiobooks);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!audiobooks) {
      getData();
    } else {
      setRefreshing(false);
    }
  }, [library]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search audiobooks...",
        onChangeText: (event: NativeSyntheticEvent<TextInputFocusEventData>) =>
          setSearch(event.nativeEvent.text),
      },
      headerLargeTitle: true,
      // headerRight: HeaderRight,
    });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  }, []);

  const [allBooks, recentlyAdded, currentlyListening] = useMemo(() => {
    if (audiobooks?.byId) {
      const allBooks: PlexAudiobook[] = Array.from(audiobooks.byId.values());
      // todo: the API already sorts for us, update our request to sort desc
      const recentlyAdded = allBooks
        .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
        .slice(0, 5);
      const currentlyListening = allBooks.filter((a) => a.viewOffset);
      return [allBooks, recentlyAdded, currentlyListening];
    }
    return [];
  }, [audiobooks]);

  const filteredBooks = useMemo(() => {
    if (allBooks && search != "") {
      return allBooks.filter(
        (a) => a.title.includes(search) || a.author?.includes(search),
      );
    }
  }, [search]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      backgroundColor="$purple1"
    >
      <YStack mt={Platform.OS == "web" ? headerHeight : 0}>
        <YStack padding="$3" gap="$5">
          {filteredBooks && (
            <AudiobookSection
              title="Search"
              audiobooks={filteredBooks}
              footerType={AudiobookCardFooterType.Hidden}
            />
          )}
          {!filteredBooks && (
            <>
              {!!currentlyListening?.length && (
                <AudiobookSection
                  title="Continue Reading"
                  audiobooks={currentlyListening}
                  footerType={AudiobookCardFooterType.TimeRemaining}
                />
              )}
              <AudiobookSection
                title="Recently Added"
                audiobooks={recentlyAdded}
                footerType={AudiobookCardFooterType.AddedAt}
              />
            </>
          )}
        </YStack>
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
