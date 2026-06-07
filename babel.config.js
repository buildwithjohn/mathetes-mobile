// NativeWind v4 + Expo Router. In Reanimated 4 (Expo SDK 54) the babel plugin
// moved to react-native-worklets and must be listed last.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-worklets/plugin"],
  };
};
