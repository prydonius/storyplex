import type { IconProps } from "@tamagui/helpers-icon";
import { Pause, Play } from "@tamagui/lucide-icons";
import { Spinner } from "tamagui";

export interface PlayPauseIconProps extends IconProps {
  isLoading: boolean;
  isPlaying: boolean;
}
export default function PlayPauseIcon({
  isLoading,
  isPlaying,
  ...props
}: PlayPauseIconProps) {
  if (isLoading) {
    return <Spinner size="large" ml="$1" mt="$0.75" />;
  }
  return isPlaying ? <Pause {...props} /> : <Play {...props} marginLeft="$2" />;
}
