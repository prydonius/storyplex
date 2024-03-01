import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { persist, createJSONStorage } from "zustand/middleware";
import { deepmergeDefined } from "../utils/DeepmergeDefined";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlexAudiobook, PlexLibrary } from "../api/PlexClient";

// DEV: Uncomment to reset state:
// AsyncStorage.clear();

type State = {
  authToken?: string;
  plexConnection?: {
    serverName: string;
    serverUri: string;
    serverAccessToken: string;
  };
  plexLibrary?: PlexLibrary;
  // imported audiobooks
  audiobooks?: {
    byId: Map<number, PlexAudiobook>;
  };

  playbackRate: number;
};

type Actions = {
  setPlexAuthToken: (token: string) => void;
  setPlexServer: (name: string, uri: string, accessToken: string) => void;
  setPlexLibrary: (library: PlexLibrary) => void;
  setAudiobooks: (audiobooks: PlexAudiobook[]) => void;
  updateAudiobook: (audiobook: PlexAudiobook) => void;
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
      setAudiobooks: (newAudiobooks: PlexAudiobook[]) => {
        const { audiobooks } = get();
        const newById = new Map(
          newAudiobooks.map((a) => {
            const existing = audiobooks?.byId.get(a.key);
            // merge existing books with local state
            const value = existing ? deepmergeDefined(existing, a) : a;
            return [a.key, value];
          }),
        );
        set({ audiobooks: { byId: newById } });
      },
      updateAudiobook: (audiobook: PlexAudiobook) => {
        const { audiobooks } = get();
        if (audiobooks) {
          const byId = new Map(audiobooks.byId);
          byId.set(audiobook.key, audiobook);
          set({
            audiobooks: {
              byId: byId,
            },
          });
        }
      },
    }),
    {
      name: "StoryPlex",
      storage: createJSONStorage(() => AsyncStorage, {
        replacer: (key, value) => {
          if (value instanceof Map) {
            return { type: "map", value: Array.from(value.entries()) };
          }
          return value;
        },
        reviver: (key, value) => {
          if (value && value.type === "map") {
            return new Map(value.value);
          }
          // Date fields are stored as strings
          if (key == "addedAt" || key == "lastViewedAt") {
            return new Date(value);
          }
          return value;
        },
      }),
    },
  ),
);

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Store", useStore);
}
