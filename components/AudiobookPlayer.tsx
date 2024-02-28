import { State } from "@lukehagar/plexjs/src/models/operations";
import {
  GaugeCircle,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
} from "@tamagui/lucide-icons";
import { Duration } from "luxon";
import { useEffect, useState } from "react";
import { Button, Group, Slider, Text, XStack, YStack, useTheme } from "tamagui";
import { PlexAudiobook, PlexChapter, PlexPlayQueue } from "../api/PlexClient";
import { usePlexClient } from "../utils/PlexClientProvider";
import ChapterSelector from "./ChapterSelector";
import PlayPauseIcon from "./PlayPauseIcon";
import usePlayer from "../hooks/usePlayer";

// playback status is updated every 250ms, so update plex every 5s
const PlexProgressUpdateIntervalMultiplier = 20;
const RewindDurationMillis = 15 * 1000;
const ForwardDurationMillis = 30 * 1000;

export interface AudiobookPlayerProps {
  audiobook: PlexAudiobook;
  queue: PlexPlayQueue;
}
export default function AudiobookPlayer({
  audiobook,
  queue,
}: AudiobookPlayerProps) {
  const [client] = usePlexClient();
  const [chapter, setChapter] = useState<PlexChapter>();
  const [progressUpdateCount, setProgressUpdateCount] = useState<number>(
    PlexProgressUpdateIntervalMultiplier - 1,
  );
  const theme = useTheme();

  const player = usePlayer(audiobook);

  useEffect(() => {
    const currentChapter = audiobook?.chapters?.find(
      (c) =>
        player.position >= c.startTimeOffset &&
        player.position < c.endTimeOffset,
    );
    setChapter(currentChapter);

    if (progressUpdateCount == 0) {
      updatePlexProgress();
      setProgressUpdateCount(PlexProgressUpdateIntervalMultiplier);
    } else {
      setProgressUpdateCount(progressUpdateCount - 1);
    }
  }, [player.position]);

  const updatePlexProgress = () => {
    client.updateProgress(
      queue,
      player.position,
      player.isPlaying ? State.Playing : State.Paused,
    );
  };

  const togglePlay = () => {
    player.togglePlay();
  };

  const rewindPlay = () => {
    player.rewindPlay(RewindDurationMillis);
  };

  const forwardPlay = () => {
    player.forwardPlay(ForwardDurationMillis);
  };

  const increaseRate = () => {
    const newRate = (player.rate * 10 + 1) / 10;
    player.setRate(newRate);
  };

  const decreaseRate = () => {
    const newRate = (player.rate * 10 - 1) / 10;
    player.setRate(newRate);
  };

  const handleSliderChange = (value: number[]) => {
    if (!player) return false;

    const [progressValue] = value;

    const newPositionMillis = chapter
      ? (progressValue / 100) * chapterDuration + chapter.startTimeOffset
      : (progressValue / 100) * audiobook.duration;

    player.setPosition(Math.floor(newPositionMillis));
  };

  const onSelectChapter = (index: number) => {
    if (!player || !audiobook.chapters) return;
    const toChapter = audiobook.chapters.find((c) => c.index == index);
    // add 1 to chapter start offset to help chapter selection
    if (toChapter) player.setPosition(toChapter.startTimeOffset + 1);
  };

  const formatPlaybackTime = (time: number) => {
    const dur = Duration.fromMillis(time);
    if (dur.as("hours") < 1) {
      return dur.toFormat("mm:ss");
    } else {
      return dur.toFormat("hh:mm:ss");
    }
  };

  const formatRemainingTime = (time: number) => {
    const dur = Duration.fromMillis(time);
    const formatted = dur.shiftTo("hours", "minutes").toObject();
    return `${formatted.hours} hrs ${Math.floor(formatted.minutes!)} mins`;
  };

  const positionInBook = player.position;
  let progressPercent = Math.floor((positionInBook / audiobook.duration) * 100);

  let positionInChapter = 0;
  let chapterDuration = 0;
  if (chapter) {
    positionInChapter = positionInBook - chapter.startTimeOffset;
    chapterDuration = chapter.endTimeOffset - chapter.startTimeOffset;
    progressPercent = Math.floor((positionInChapter / chapterDuration) * 100);
  }

  return (
    <>
      {chapter && (
        <ChapterSelector
          current={chapter}
          chapters={audiobook.chapters!}
          onSelectChapter={onSelectChapter}
        />
      )}
      <XStack
        marginVertical="$5"
        gap="$3"
        justifyContent="center"
        alignItems="center"
      >
        <Button
          onPress={rewindPlay}
          icon={<RotateCcw position="absolute" />}
          scaleIcon={2.5}
          size="$6"
          circular
        >
          <Text position="absolute">15</Text>
        </Button>
        <Button
          onPress={togglePlay}
          backgroundColor={theme.purple4}
          icon={
            <PlayPauseIcon
              isLoading={player.isLoading}
              isPlaying={player.isPlaying}
              fill={theme.color.get()}
            />
          }
          scaleIcon={2}
          size="$8"
          circular
        />
        <Button
          onPress={forwardPlay}
          icon={<RotateCw position="absolute" />}
          scaleIcon={2.5}
          size="$6"
          circular
        >
          <Text position="absolute">30</Text>
        </Button>
      </XStack>
      <XStack>
        <Slider
          defaultValue={[progressPercent]}
          value={[progressPercent]}
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          flex={1}
        >
          <Slider.Track>
            <Slider.TrackActive />
          </Slider.Track>
          <Slider.Thumb
            size="$0.75"
            index={0}
            circular
            backgroundColor={theme.purple5}
            pressStyle={{
              borderColor: theme.purple5,
              backgroundColor: theme.color1,
            }}
            focusStyle={{
              borderColor: theme.purple5,
              backgroundColor: theme.color1,
            }}
          />
        </Slider>
      </XStack>
      <XStack mt="$2" alignItems="center">
        <YStack flex={1}>
          <Text>
            {formatPlaybackTime(chapter ? positionInChapter : positionInBook)}
          </Text>
        </YStack>
        <YStack flex={1} alignItems="center">
          <Text>Time left in book:</Text>
          <Text>
            {formatRemainingTime(audiobook.duration - positionInBook)}
          </Text>
        </YStack>
        <YStack flex={1} alignItems="flex-end">
          <Text>
            -
            {formatPlaybackTime(
              chapter
                ? chapterDuration - positionInChapter
                : audiobook.duration - positionInBook,
            )}
          </Text>
        </YStack>
      </XStack>
      <XStack mt="$3">
        <YStack>
          <Group orientation="vertical">
            <Group.Item>
              <Button
                onPress={() => increaseRate()}
                icon={<Plus />}
                size="$2"
              />
            </Group.Item>
            <Group.Item>
              <Button icon={<GaugeCircle />} size="$2" disabled>
                {`${player.rate}x`}
              </Button>
            </Group.Item>
            <Group.Item>
              <Button
                onPress={() => decreaseRate()}
                icon={<Minus />}
                size="$2"
              />
            </Group.Item>
          </Group>
        </YStack>
      </XStack>
    </>
  );
}
