import { useEffect, useState } from "react";
import TrackPlayer, {
  State,
  useIsPlaying,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { PlayerControls } from "../types";
import { PlexAudiobook } from "../api/PlexClient";

export default function usePlayer(audiobook: PlexAudiobook): PlayerControls {
  return useReactNativeTrackPlayer(audiobook);
}

function useReactNativeTrackPlayer(audiobook: PlexAudiobook): PlayerControls {
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  useEffect(() => {
    const run = async () => {
      try {
        await TrackPlayer.load({
          id: audiobook.key.toString(),
          url: audiobook.uri!,
          title: audiobook.title,
          artist: audiobook.author,
          artwork: audiobook.thumb,
        });
        await TrackPlayer.stop();

        if (audiobook.viewOffset) {
          // viewOffset is in milliseconds
          TrackPlayer.seekTo(audiobook.viewOffset / 1000);
        }
      } catch (e) {
        console.log(e);
      }
    };
    run();

    // cleanup
    return () => {};
  }, []);

  useEffect(() => {
    TrackPlayer.setRate(playbackRate).catch((e) =>
      console.log("error setting rate", e),
    );
  }, [playbackRate]);

  const { position } = useProgress(250);
  const { playing } = useIsPlaying();
  const { state } = usePlaybackState();

  // position is in seconds
  const currentPosition = position
    ? position * 1000
    : audiobook.viewOffset ?? 0;

  const isLoading =
    state != State.Paused && state != State.Playing && state != State.Stopped;

  return {
    isLoading: isLoading,
    isPlaying: playing ?? false,
    position: currentPosition,
    rate: playbackRate,
    togglePlay: async () => {
      const state = (await TrackPlayer.getPlaybackState()).state;
      if (state == State.Playing) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
    },
    rewindPlay: (durationMillis: number) => {
      TrackPlayer.seekBy((durationMillis / 1000) * -1);
    },
    forwardPlay: (durationMillis: number) => {
      TrackPlayer.seekBy(durationMillis / 1000);
    },
    setRate: (rate: number) => {
      setPlaybackRate(rate);
    },
    setPosition: (positionMillis: number) => {
      TrackPlayer.seekTo(positionMillis / 1000);
    },
  };
}
