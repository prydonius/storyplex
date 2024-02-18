import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import {
  Adapt,
  Button,
  Popover,
  XStack,
  YGroup,
  Separator,
  ListItem,
} from "tamagui";
import { PlexChapter } from "../api/PlexClient";
import { useState } from "react";
import { ScrollView } from "react-native";

function chapterName(index: number, chapterTag?: string) {
  return chapterTag ?? `Chapter ${index}`;
}

export interface ChapterSelectorProps {
  chapters: PlexChapter[];
  current: PlexChapter;
  onSelectChapter: (index: number) => void;
}
export default function ChapterSelector(props: ChapterSelectorProps) {
  return (
    <>
      <XStack alignItems="center" justifyContent="center" gap="$3">
        <Button
          icon={<ChevronLeft />}
          size="$1"
          circular
          onPress={() => {
            props.onSelectChapter(props.current.index - 1);
          }}
        ></Button>
        <ChapterListPopover {...props} />
        <Button
          icon={<ChevronRight />}
          size="$1"
          circular
          onPress={() => {
            props.onSelectChapter(props.current.index + 1);
          }}
        ></Button>
      </XStack>
    </>
  );
}

export function ChapterListPopover(props: ChapterSelectorProps) {
  const [scrollViewRef, setScrollViewRef] = useState<ScrollView | null>(null);

  const scrollTo = (y: number) => {
    scrollViewRef?.scrollTo({ x: 0, y: y });
  };

  return (
    <Popover size="$4" allowFlip>
      <Popover.Trigger asChild>
        <Button size="$2">
          {chapterName(props.current.index, props.current.tag)}
        </Button>
      </Popover.Trigger>

      <Adapt when="sm" platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom>
          <Popover.Sheet.Frame padding="$4">
            <Popover.Sheet.ScrollView
              ref={(ref) => {
                ref && setScrollViewRef(ref);
              }}
            >
              <Adapt.Contents />
            </Popover.Sheet.ScrollView>
          </Popover.Sheet.Frame>
        </Popover.Sheet>
      </Adapt>

      <Popover.Content
        maxHeight={200}
        padding={0}
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
        <Popover.ScrollView
          ref={(ref) => {
            ref && setScrollViewRef(ref);
          }}
        >
          <ChapterList scrollTo={scrollTo} {...props} />
        </Popover.ScrollView>
      </Popover.Content>
    </Popover>
  );
}

function ChapterList({
  chapters,
  current,
  scrollTo,
  onSelectChapter,
}: {
  chapters: PlexChapter[];
  current: PlexChapter;
  scrollTo: (y: number) => void;
  onSelectChapter: (index: number) => void;
}) {
  return (
    <YGroup>
      {chapters.map((chapter) => {
        return (
          <YGroup.Item key={chapter.index}>
            {chapter.index != 1 && <Separator />}
            <Popover.Close asChild>
              <ListItem
                onPress={() => {
                  onSelectChapter(chapter.index);
                }}
                hoverTheme
                pressTheme
                onLayout={(e) => {
                  if (chapter.index == current.index) {
                    scrollTo(
                      (e.nativeEvent.layout.height + 1) * (current.index - 1),
                    );
                  }
                }}
                title={chapterName(chapter.index, chapter.tag)}
              />
            </Popover.Close>
          </YGroup.Item>
        );
      })}
    </YGroup>
  );
}
