import React from "react";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import "../tamagui.css";
import { useColorScheme } from "react-native";
import { TamaguiProvider, useTheme } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { config } from "../tamagui.config";
import { useStore } from "../store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

export default function RootLayout() {
  const hasHydrated = useStore.persist.hasHydrated;
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (!loaded && !hasHydrated) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme?.toString()}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Layout />
      </ThemeProvider>
    </TamaguiProvider>
  );
}

export const Layout = () => {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.background.val,
      }}
    >
      <Slot />
    </SafeAreaView>
  );
};
