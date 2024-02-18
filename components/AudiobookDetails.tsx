import { H2, H6, Separator, XStack } from "tamagui";
import { Image } from "expo-image";
import { PlexAudiobook } from "../api/PlexClient";

export interface AudiobookDetailsProps {
  audiobook: PlexAudiobook;
}
export default function AudiobookDetails({ audiobook }: AudiobookDetailsProps) {
  return (
    <>
      <XStack paddingBottom="$0">
        <H2>{audiobook.title}</H2>
      </XStack>
      <XStack>
        <H6>{audiobook.author}</H6>
      </XStack>
      <Separator padding="$2" />
      <XStack alignSelf="center" padding="$5">
        <XStack elevation={5} width={200} height={200}>
          <Image
            source={audiobook.thumb}
            contentFit="cover"
            style={{ flex: 1 }}
          />
        </XStack>
      </XStack>
    </>
  );
}
