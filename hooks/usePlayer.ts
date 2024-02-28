import { AVPlaybackStatus, Audio, InterruptionModeIOS } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { PlayerControls } from "../types";
import { PlexAudiobook } from "../api/PlexClient";

export default function usePlayer(audiobook: PlexAudiobook): PlayerControls {
  // React Native Track Player doesn't support web yet: https://github.com/doublesymmetry/react-native-track-player/issues/572
  // fallback to Expo AV
  return useExpoAVPlayer(audiobook);
}

function useExpoAVPlayer(audiobook: PlexAudiobook): PlayerControls {
  const playbackRef = useRef<Audio.Sound>();
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus>();
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [buffering, setBuffering] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });
      const { sound } = await Audio.Sound.createAsync(
        {
          uri: audiobook.uri!,
        },
        {
          positionMillis: audiobook.viewOffset ?? 0,
        },
        setPlaybackStatus,
      );
      playbackRef.current = sound;
    };
    run();

    // cleanup
    return () => {
      if (playbackRef.current) {
        playbackRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (playbackStatus?.isLoaded && playbackStatus.isPlaying) {
      setBuffering(false);
    }
  }, [playbackStatus?.isLoaded && playbackStatus.isPlaying]);

  const playback = playbackRef.current;
  const isLoaded =
    (playbackStatus?.isLoaded && !buffering && !!playback) ?? false;

  return {
    isLoading: !isLoaded,
    isPlaying: (playbackStatus?.isLoaded && playbackStatus.isPlaying) ?? false,
    position: playbackStatus?.isLoaded
      ? playbackStatus.positionMillis
      : audiobook.viewOffset ?? 0,
    rate: playbackRate,
    togglePlay: () => {
      if (!playbackStatus?.isLoaded || !playback) return;

      if (playbackStatus.isPlaying) {
        playback.pauseAsync();
      } else {
        // set buffering so loading state is triggered
        setBuffering(true);
        playback.playAsync();
      }
    },
    rewindPlay: (duration: number) => {
      if (!playbackStatus?.isLoaded || !playback) return;
      playback.setPositionAsync(playbackStatus.positionMillis - duration);
    },
    forwardPlay: (duration: number) => {
      if (!playbackStatus?.isLoaded || !playback) return;
      playback.setPositionAsync(playbackStatus.positionMillis + duration);
    },
    setRate(rate: number) {
      if (!playback) return;
      setPlaybackRate(rate);
      playback.setRateAsync(rate, true);
    },
    setPosition: async (position: number) => {
      if (!playback) return;
      playback.setPositionAsync(position);
    },
  };
}
