import React from "react";
import { H4, View, XStack } from "tamagui";
import { PlexAudiobook } from "../api/PlexClient";
import AudiobookCard, { AudiobookCardFooterType } from "./AudiobookCard";

interface AudiobookSectionProps {
  title: string;
  audiobooks: PlexAudiobook[] | undefined;
  footerType: AudiobookCardFooterType;
}
export function AudiobookSection(props: AudiobookSectionProps) {
  return (
    <View gap="$2">
      <XStack>
        <H4>{props.title}</H4>
      </XStack>
      <XStack flexWrap="wrap" gap="$3">
        {props.audiobooks?.map((a) => {
          return (
            <AudiobookCard
              key={a.key}
              audiobook={a}
              footerType={props.footerType}
            />
          );
        })}
      </XStack>
    </View>
  );
}
