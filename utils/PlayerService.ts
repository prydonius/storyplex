import { Platform } from "react-native";
import TrackPlayer, { Capability } from "react-native-track-player";
import { Event } from "react-native-track-player";

if (Platform.OS == "ios" || Platform.OS == "android") {
  TrackPlayer.registerPlaybackService(() => PlayerService);
  TrackPlayer.setupPlayer();
  TrackPlayer.updateOptions({
    backwardJumpInterval: 15,
    forwardJumpInterval: 30,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.JumpForward,
      Capability.JumpBackward,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
  });
}

async function PlayerService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, () => {
    TrackPlayer.seekBy(-15);
  });
  TrackPlayer.addEventListener(Event.RemoteJumpForward, () => {
    TrackPlayer.seekBy(30);
  });
}
