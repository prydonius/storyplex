export interface PlayerControls {
  isLoading: boolean;
  isPlaying: boolean;
  position: number;
  rate: number;

  togglePlay: () => void;
  rewindPlay: (duration: number) => void;
  forwardPlay: (duration: number) => void;
  setRate: (rate: number) => void;
  setPosition: (position: number) => void;
}
