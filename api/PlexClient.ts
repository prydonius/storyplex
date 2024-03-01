import * as WebBrowser from "expo-web-browser";
import qs from "qs";
import { PlexAPI } from "@lukehagar/plexjs/src";
import { HTTPClient } from "@lukehagar/plexjs/src/lib/http";
import { State, Tag } from "@lukehagar/plexjs/src/models/operations";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class PlexClient {
  private static plexAppName = "StoryPlex";
  private static plexClientId = "79845078-cf5c-42bf-96f0-91e6bf76316e";
  private static plexApiBase = "https://plex.tv/api/v2";
  private static audnexusAgent = "com.plexapp.agents.audnexus";
  private static headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Plex-Product": this.plexAppName,
    "X-Plex-Client-Identifier": this.plexClientId,
  };
  private authToken: string;
  private serverUri: string;
  sdk: PlexAPI;

  constructor(authToken: string, plexUri?: string) {
    this.authToken = authToken;

    const httpClient = new HTTPClient({
      // fetcher takes a function that has the same signature as native `fetch`.
      fetcher: (request) => {
        return fetch(request);
      },
    });

    httpClient.addHook("beforeRequest", (request) => {
      const nextRequest = new Request(request, {
        signal: request.signal || AbortSignal.timeout(5000),
      });

      return nextRequest;
    });

    httpClient.addHook("requestError", (error, request) => {
      console.group("Request Error");
      console.log("Reason:", `${error}`);
      console.log("Endpoint:", `${request.method} ${request.url}`);
      console.groupEnd();
    });

    this.sdk = new PlexAPI({
      accessToken: authToken,
      serverURL: plexUri,
      httpClient: httpClient,
    });

    this.serverUri = plexUri ?? "";
  }

  static async getPlexAuth(): Promise<string | undefined> {
    const plexPinRequest = await fetch(`${this.plexApiBase}/pins?strong=true`, {
      method: "POST",
      headers: this.headers,
    });

    const response = await plexPinRequest.json();
    const { id, code } = response;

    const authAppUrl =
      "https://app.plex.tv/auth#?" +
      qs.stringify({
        clientID: this.plexClientId,
        code: code,
        context: {
          device: {
            product: this.plexAppName,
          },
        },
      });

    WebBrowser.openAuthSessionAsync(authAppUrl);

    let authToken: string | null = null;
    do {
      const plexAuthTokenRequest = await fetch(
        `${this.plexApiBase}/pins/${id}?${qs.stringify({ code: code })}`,
        {
          method: "GET",
          headers: this.headers,
        },
      );

      const response = await plexAuthTokenRequest.json();
      authToken = response.authToken;
      await delay(1000);
    } while (authToken == null);

    WebBrowser.dismissAuthSession();
    return authToken;
  }

  async getPlexServers(): Promise<PlexServer[]> {
    const request = await fetch(
      `${PlexClient.plexApiBase}/resources?includeHttps=true&X-Plex-Token=${this.authToken}`,
      {
        method: "GET",
        headers: PlexClient.headers,
      },
    );
    const data = await request.json();

    return data.map((r: PlexResource) => ({
      name: r.name,
      ip: r.publicAddress,
      uri: r.connections.find((c) => !c.local)?.uri,
      accessToken: r.accessToken,
    }));
  }

  async getLibraries(): Promise<PlexLibrary[]> {
    const librariesRequest = await this.sdk.library.getLibraries();
    if (
      librariesRequest.statusCode != 200 ||
      !librariesRequest.object?.mediaContainer?.directory
    ) {
      throw Error("Unable to fetch libraries");
    }

    return librariesRequest.object.mediaContainer.directory.map((lib) => ({
      key: Number(lib.key!),
      agent: lib.agent!,
      title: lib.title!,
      type: lib.type!,
      path: lib.location?.at(0)?.path ?? "",
      supported: lib.agent == PlexClient.audnexusAgent,
    }));
  }

  async getAudiobooks(library: number): Promise<PlexAudiobook[]> {
    const request = await this.sdk.library.getLibraryItems(
      library,
      Tag.All,
      // TODO: figure out if this is specific to my plex library or constant across all music libraries
      "type=9&includeMeta=1&includeAdvanced=1&includeChildren=1&includeChapters=1",
    );

    if (
      request.statusCode != 200 ||
      !request.object?.mediaContainer?.metadata
    ) {
      throw Error("Unable to fetch library items");
    }

    return request.object.mediaContainer.metadata.map((item) => ({
      key: Number(item.ratingKey!),
      thumb: item.thumb
        ? `${this.serverUri}${item.thumb}?X-Plex-Token=${this.authToken}`
        : undefined,
      title: item.title!,
      author: item.parentTitle,
      summary: item.summary,
      year: item.year,
      addedAt: new Date(item.addedAt! * 1000),
      duration: item.duration!,
      viewOffset: item.viewOffset,
    }));
  }

  async queueAudiobook(key: number): Promise<[PlexPlayQueue, PlexAudiobook]> {
    const query = qs.stringify({
      type: "audio",
      uri: `library://x/item//library/metadata/${key.toString()}`,
      own: 1,
      includeChapters: 1,
      "X-Plex-Token": this.authToken,
    });

    const request = await fetch(`${this.serverUri}/playQueues?${query}`, {
      headers: PlexClient.headers,
      method: "POST",
    });

    const data = await request.json();
    const playQueue = data.MediaContainer;
    return [playQueue, this.audiobookFromQueue(playQueue)];
  }

  audiobookFromQueue(queue: PlexPlayQueue): PlexAudiobook {
    const audiobookSrcPath = queue.Metadata[0].Media[0].Part[0].key;
    const audiobookUri = `${this.serverUri}${audiobookSrcPath}?X-Plex-Token=${this.authToken}`;
    return {
      // the parent key is the "album" key for this audiobook
      key: Number(queue.Metadata[0].parentRatingKey),
      thumb: queue.Metadata[0].thumb
        ? `${this.serverUri}${queue.Metadata[0].thumb}?X-Plex-Token=${this.authToken}`
        : undefined,
      title: queue.Metadata[0].title,
      author: queue.Metadata[0].originalTitle,
      summary: undefined, // unavailable from this API
      year: queue.Metadata[0].parentYear,
      addedAt: new Date(queue.Metadata[0].addedAt * 1000),
      lastViewedAt: new Date(queue.Metadata[0].lastViewedAt * 1000),
      uri: audiobookUri,
      viewOffset: queue.Metadata[0].viewOffset,
      duration: queue.Metadata[0].duration,
      chapters: queue.Metadata[0].Chapter,
    };
  }

  updateProgress(queue: PlexPlayQueue, positionMillis: number, state: State) {
    this.sdk.video.getTimeline(
      {
        ratingKey: Number(queue.Metadata[0].ratingKey),
        key: queue.Metadata[0].key,
        state: state,
        time: Math.floor(positionMillis),
        duration: queue.Metadata[0].duration,
        context: "",
        playQueueItemID: queue.playQueueSelectedItemID,
        // unsure what these are
        hasMDE: 0,
        playBackTime: 0,
        row: 0,
      },
      {
        fetchOptions: {
          headers: PlexClient.headers,
        },
      },
    );
  }
}

interface PlexResource {
  name: string;
  connections: {
    uri: string;
    local: boolean;
  }[];
  publicAddress: string;
  accessToken: string;
}

export interface PlexServer {
  name: string;
  ip: string;
  uri: string;
  accessToken: string;
}

export interface PlexLibrary {
  key: number;
  agent: string;
  title: string;
  type: string;
  path: string;
  supported: boolean;
}

export interface PlexAudiobook {
  key: number;
  thumb?: string;
  title: string;
  author?: string; // parentTitle in Plex API response
  summary?: string;
  year?: number;
  addedAt: Date;
  lastViewedAt?: Date;
  uri?: string;
  viewOffset?: number;
  duration: number;
  chapters?: PlexChapter[];
}

export interface PlexPlayQueue {
  playQueueID: number;
  playQueueSelectedItemID: number;
  Metadata: PlexItemMetadata[];
}

export interface PlexChapter {
  id: number;
  startTimeOffset: number;
  endTimeOffset: number;
  index: number;
  tag: string; // chapter name
}

export interface PlexItemMetadata {
  key: string;
  ratingKey: string;
  parentRatingKey: string;
  duration: number;
  viewOffset?: number;
  parentYear: number;
  thumb: string;
  title: string;
  originalTitle: string;
  addedAt: number;
  lastViewedAt: number;

  Media: {
    Part: {
      key: string;
      size: number;
      container: string;
    }[];
  }[];

  Chapter: PlexChapter[];
}
