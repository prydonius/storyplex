import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlexLibrary } from "../api/PlexClient";

// DEV: Uncomment to reset state:
// AsyncStorage.clear()

type State = {
  authToken?: string;
  plexConnection?: {
    serverName: string;
    serverUri: string;
    serverAccessToken: string;
  };
  plexLibrary?: PlexLibrary;
  playbackRate: number;
};

type Actions = {
  setPlexAuthToken: (token: string) => void;
  setPlexServer: (name: string, uri: string, accessToken: string) => void;
  setPlexLibrary: (library: PlexLibrary) => void;
  setPlaybackRate: (rate: number) => void;
};

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      playbackRate: 1,
      setPlaybackRate: (rate: number) => set({ playbackRate: rate }),
      setPlexAuthToken: (token: string) => set({ authToken: token }),
      setPlexServer: (name: string, uri: string, accessToken: string) =>
        set({
          plexConnection: {
            serverName: name,
            serverUri: uri,
            serverAccessToken: accessToken,
          },
        }),
      setPlexLibrary: (library: PlexLibrary) => set({ plexLibrary: library }),
    }),
    {
      name: "StoryPlex",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
