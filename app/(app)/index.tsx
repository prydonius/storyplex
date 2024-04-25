import { router, useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { RefreshControl } from "react-native-web-refresh-control";
import {
  ScrollView,
  XStack,
  YStack,
  ListItem,
  View,
  Input,
  H4,
  Button,
  Text,
} from "tamagui";
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
  SectionList,
  TextInputFocusEventData,
} from "react-native";
import AudiobookListItem from "../../components/AudiobookListItem";
import useAudiobookListSections from "../../hooks/useAudiobookListSections";

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
      headerRight: () => <HeaderRight setSearch={setSearch}></HeaderRight>,
    });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  }, []);

  const [allBooks, allTags, recentlyAdded, currentlyListening, discovery] =
    useMemo(() => {
      if (audiobooks?.byId) {
        const allBooks: PlexAudiobook[] = Array.from(audiobooks.byId.values());
        // todo: the API already sorts for us, update our request to sort desc
        const sortedBooks = allBooks.sort(
          (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
        );
        const recentlyAdded = sortedBooks.slice(0, 6);
        const currentlyListening = allBooks.filter((a) => a.viewOffset);

        const byTags = Array.from(audiobooks.byTag).sort(
          // sort by number of books in tags
          (a, b) => b[1].length - a[1].length,
        );

        const allTags = new Map(
          byTags.map(([tag, books]) => [tag, books.length]),
        );

        // The first two largest categories
        const discovery = new Map(byTags.slice(0, 2));

        return [
          allBooks,
          allTags,
          recentlyAdded,
          currentlyListening,
          discovery,
        ];
      }
      return [[], []];
    }, [audiobooks]);

  const filteredBooksBySection = useMemo(() => {
    if (allBooks && search != "") {
      const filter = search.toLowerCase();
      const filteredBooks = allBooks.filter(
        (a) =>
          a.title.toLowerCase().includes(filter) ||
          a.author?.toLowerCase().includes(filter) ||
          Array.from(a.tags).some((t) => t.toLowerCase().includes(filter)),
      );
      return useAudiobookListSections(filteredBooks);
    }
  }, [search]);

  if (search != "" && filteredBooksBySection) {
    return (
      <View
        backgroundColor="$purple1"
        pt={Platform.OS == "web" ? headerHeight : 0}
        flex={1}
      >
        <SectionList
          contentInsetAdjustmentBehavior="automatic"
          sections={filteredBooksBySection}
          renderItem={({ item }) => <AudiobookListItem audiobook={item} />}
          renderSectionHeader={({ section }) => (
            <ListItem backgroundColor="$purple1">{section.title}</ListItem>
          )}
          keyExtractor={(item) => item.key.toString()}
        />
      </View>
    );
  }

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
          {!filteredBooksBySection && (
            <>
              {!!currentlyListening?.length && (
                <AudiobookSection
                  title="Continue Reading"
                  audiobooks={currentlyListening}
                  footerType={AudiobookCardFooterType.TimeRemaining}
                />
              )}
              <View gap="$2">
                <XStack>
                  <H4>Discover</H4>
                </XStack>
                <ScrollView horizontal>
                  <XStack gap="$2">
                    {Array.from(allTags).map(([t, numBooks]) => (
                      <Button
                        maxWidth={150}
                        key={t}
                        size="$5"
                        onPress={() => router.push(`/tag/${t}`)}
                      >
                        <Text>
                          {t} ({numBooks})
                        </Text>
                      </Button>
                    ))}
                  </XStack>
                </ScrollView>
              </View>
              <AudiobookSection
                title="Recently Added"
                audiobooks={recentlyAdded}
                footerType={AudiobookCardFooterType.AddedAt}
              />
              {Array.from(discovery ?? []).map(([tag, books]) => {
                return (
                  <AudiobookSection
                    key={tag}
                    title={tag}
                    audiobooks={books.slice(0, 6)}
                    footerType={AudiobookCardFooterType.AddedAt}
                  />
                );
              })}
            </>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}

interface HeaderRightProps {
  setSearch: (s: string) => void;
}
function HeaderRight({ setSearch }: HeaderRightProps) {
  return (
    <XStack gap="$2" paddingRight="$2">
      {Platform.OS == "web" && (
        <>
          <Input
            placeholder="Search audiobooks..."
            size="$2"
            borderWidth={2}
            width={200}
            margin="$2"
            onChangeText={setSearch}
          />
          {/* <Button size="$2" icon={Cog} scaleIcon={1.5} />
          <Button size="$2" icon={RefreshCcw} scaleIcon={1.5} /> */}
        </>
      )}
    </XStack>
  );
}
