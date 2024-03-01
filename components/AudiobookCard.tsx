import { Image } from "expo-image";
import { router } from "expo-router";
import { Card, H6, Text, useTheme } from "tamagui";
import { PlexAudiobook } from "../api/PlexClient";
import { useMemo } from "react";
import { DateTime, Duration } from "luxon";

export enum AudiobookCardFooterType {
  Hidden,
  AddedAt,
  TimeRemaining,
}
export interface AudiobookCardProps {
  audiobook: PlexAudiobook;
  footerType: AudiobookCardFooterType;
}
export default function AudiobookCard(props: AudiobookCardProps) {
  const formatRemainingTime = (time: number) => {
    const dur = Duration.fromMillis(time);
    const formatted = dur.shiftTo("hours", "minutes").toObject();
    return `${formatted.hours} hrs left`;
  };

  const footerText = useMemo(() => {
    switch (props.footerType) {
      case AudiobookCardFooterType.AddedAt:
        return DateTime.fromJSDate(props.audiobook.addedAt).toRelative();
      case AudiobookCardFooterType.TimeRemaining:
        return formatRemainingTime(
          props.audiobook.duration - props.audiobook.viewOffset!,
        );
    }
  }, [props.footerType]);

  const path = `/audiobook/${props.audiobook.key}`;
  const theme = useTheme();

  return (
    <Card
      animation="bouncy"
      elevation={5}
      size="$4"
      width={105}
      height={105}
      cursor="pointer"
      hoverStyle={{
        scale: 1.1,
      }}
      pressStyle={{
        scale: 0.9,
      }}
      onPress={() => {
        router.push(path);
      }}
    >
      <Card.Footer
        opacity={0.7}
        {...(footerText && { backgroundColor: theme.background.get() })}
      >
        <Text scale={0.7}>{footerText}</Text>
      </Card.Footer>
      <Card.Background>
        <Image
          source={props.audiobook.thumb}
          contentFit="cover"
          style={{ flex: 1, borderRadius: 10 }}
        />
      </Card.Background>
    </Card>
  );
}
