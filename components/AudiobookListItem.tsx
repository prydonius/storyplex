import { Image } from "expo-image";
import { router } from "expo-router";
import { ListItem, Text, YStack } from "tamagui";
import { PlexAudiobook } from "../api/PlexClient";

interface AudiobookListItemProps {
  audiobook: PlexAudiobook;
}
export default function AudiobookListItem({
  audiobook,
}: AudiobookListItemProps) {
  const path = `/audiobook/${audiobook.key}`;
  return (
    <ListItem
      hoverTheme
      pressTheme
      backgroundColor="$purple1"
      onPress={() => {
        router.push(path);
      }}
      flex={1}
    >
      <YStack elevation={5} width={75} height={75}>
        <Image
          source={audiobook.thumb}
          contentFit="cover"
          style={{ flex: 1, borderRadius: 10 }}
        />
      </YStack>
      <YStack flex={1} paddingHorizontal="$3">
        <Text fontFamily="InterBold">{audiobook.title}</Text>
        <Text pt="$1.5">{audiobook.author}</Text>
        <Text fontSize="$2" fontFamily="InterItalic" pt="$1.5">
          {Array.from(audiobook.tags).join(", ")}
        </Text>
      </YStack>
    </ListItem>
  );
}
