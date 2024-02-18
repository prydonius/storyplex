import React from "react";
import { useStore } from "../store";
import { PlexClient, PlexLibrary } from "../api/PlexClient";
import { useShallow } from "zustand/react/shallow";
import { Redirect } from "expo-router";

const PlexClientContext = React.createContext<
  [PlexClient | null, PlexLibrary | null]
>([null, null]);

export function usePlexClient(): [PlexClient, PlexLibrary] {
  const [client, library] = React.useContext(PlexClientContext);
  if (client == null || library == null) {
    throw Error("usePlexClient must be used within a PlexClientProvider");
  }
  return [client, library];
}

export function PlexClientProvider(props: React.PropsWithChildren) {
  const [plexAuthToken, conn, library] = useStore(
    useShallow((state) => [
      state.authToken,
      state.plexConnection,
      state.plexLibrary,
    ]),
  );

  if (!plexAuthToken) {
    return <Redirect href="/login" />;
  } else if (!conn) {
    return <Redirect href="/setup" />;
  } else if (!library) {
    return <Redirect href="/libraries" />;
  }

  const client = new PlexClient(plexAuthToken, conn.serverUri);

  return (
    <PlexClientContext.Provider value={[client, library]}>
      {props.children}
    </PlexClientContext.Provider>
  );
}
