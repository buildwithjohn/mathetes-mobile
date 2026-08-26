// NativeWind v4 + Expo Router. In Reanimated 4 (Expo SDK 54) the babel plugin
// moved to react-native-worklets and must be listed last.
//
// Web-only: Reanimated 4's `entering`/`exiting`/`layout` animations don't mount
// their content on web (the animated element renders no DOM), which hides every
// animated hero element. On web builds we strip those JSX props so components
// render in their final state; native keeps full motion.
function stripReanimatedLayoutPropsOnWeb() {
  const TARGETS = new Set(["entering", "exiting", "layout"]);
  return {
    name: "strip-reanimated-layout-props-web",
    visitor: {
      JSXAttribute(path) {
        const name = path.node.name;
        if (name && name.type === "JSXIdentifier" && TARGETS.has(name.name)) {
          path.remove();
        }
      },
    },
  };
}

module.exports = function (api) {
  const platform = api.caller((caller) => (caller ? caller.platform : null));
  // Cache per-platform so the web-only plugin never leaks into native builds.
  api.cache.using(() => platform);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ...(platform === "web" ? [stripReanimatedLayoutPropsOnWeb] : []),
      "react-native-worklets/plugin",
    ],
  };
};
