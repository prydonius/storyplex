import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "expo-dev-client";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider, useTheme, View } from "tamagui";
import { useStore } from "../store";
import { config } from "../tamagui.config";
import "../tamagui.css";

// Setup TrackPlayer on mobile
import "../utils/PlayerService";

// Hide the splash screen until loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasHydrated = useStore.persist.hasHydrated;
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (loaded && hasHydrated()) {
      SplashScreen.hideAsync();
    }
  }, [loaded, hasHydrated()]);

  if (!loaded || !hasHydrated) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme?.toString()}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ThemedLayout />
      </ThemeProvider>
    </TamaguiProvider>
  );
}

function ThemedLayout() {
  // const theme = useTheme();
  return <Slot />;
}
