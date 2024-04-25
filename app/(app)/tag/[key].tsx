import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect, useMemo } from "react";
import { Platform, SectionList } from "react-native";
import { ListItem, View } from "tamagui";
import { useShallow } from "zustand/react/shallow";
import AudiobookListItem from "../../../components/AudiobookListItem";
import useAudiobookListSections from "../../../hooks/useAudiobookListSections";
import { useStore } from "../../../store";

export default function Tag() {
  const { key } = useLocalSearchParams<{ key: string }>();
  if (!key) return;
  const [audiobooks] = useStore(useShallow((state) => [state.audiobooks]));
  const headerHeight = useHeaderHeight();

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: key });
  }, [navigation]);

  const booksBySection = useMemo(
    () => useAudiobookListSections(audiobooks?.byTag.get(key) ?? []),
    [key],
  );

  return (
    <View
      backgroundColor="$purple1"
      flex={1}
      pt={Platform.OS == "web" ? headerHeight : 0}
    >
      <SectionList
        contentInsetAdjustmentBehavior="automatic"
        sections={booksBySection}
        renderItem={({ item }) => <AudiobookListItem audiobook={item} />}
        renderSectionHeader={({ section }) => (
          <ListItem backgroundColor="$purple1">{section.title}</ListItem>
        )}
        keyExtractor={(item) => item.key.toString()}
      />
    </View>
  );
}
