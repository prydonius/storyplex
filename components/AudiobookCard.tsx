import { Image } from "expo-image";
import { router } from "expo-router";
import { Card, Text } from "tamagui";

export interface AudiobookCardProps {
  path: string;
  thumb?: string;
}
export default function AudiobookCard(props: AudiobookCardProps) {
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
        router.push(props.path);
      }}
    >
      <Card.Footer backgrounded opacity={0.5}>
        <Text paddingHorizontal="$2">5hrs left</Text>
      </Card.Footer>
      <Card.Background>
        <Image
          source={props.thumb}
          contentFit="cover"
          style={{ flex: 1, borderRadius: 10 }}
        />
      </Card.Background>
    </Card>
  );
}
