import { SectionListData } from "react-native";
import { PlexAudiobook } from "../api/PlexClient";

export default function useAudiobookListSections(
  audiobooks: PlexAudiobook[],
): SectionListData<PlexAudiobook>[] {
  return (
    Array.from(
      audiobooks.reduce((sections, a) => {
        // section title is the first letter of the title (alphabetical)
        const sectionKey = a.title[0];
        sections.set(sectionKey, [...(sections.get(sectionKey) ?? []), a]);
        return sections;
      }, new Map<string, PlexAudiobook[]>()),
    )
      // sort by section title
      .sort(([a, _], [b, _1]) => a.localeCompare(b))
      .map(([title, books]) => ({ title: title, data: books }))
  );
}
