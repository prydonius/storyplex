const DEV_BUILD = process.env.APP_VARIANT === "development";

function devify(str: string, devPostfix: string) {
  if (!DEV_BUILD) return "";
  return `${str}${devPostfix}`;
}

export default {
  expo: {
    name: devify("storyplex", " (Dev)"),
    slug: "storyplex",
    scheme: "storyplex",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: devify("com.prydonius.storyplex", ".dev"),
      buildNumber: "3",
      infoPlist: { UIBackgroundModes: ["audio"] },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
      ],
    },
    web: { favicon: "./assets/favicon.png" },
    extra: { eas: { projectId: "4f68740b-be9d-440e-ae0f-73d84f2ffeb0" } },
    owner: "prydonius",
    plugins: ["expo-router", "expo-av"],
  },
};
