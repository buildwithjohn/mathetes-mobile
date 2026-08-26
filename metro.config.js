const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// NativeWind wraps the config and sets its own resolveRequest, so we apply the
// web fix AFTER it and delegate to whatever resolver is already in place.
const config = withNativeWind(getDefaultConfig(__dirname), {
  input: "./global.css",
});

// Web-only fix: zustand's ESM build (esm/*.mjs, picked via the "import" export
// condition on web) uses `import.meta`, which Metro leaves intact and the
// browser rejects ("Cannot use 'import.meta' outside a module"), blanking the
// whole app. Resolve normally, then redirect any zustand ESM file to its CJS
// twin on web. Native is untouched (it resolves via zustand's react-native
// export, already CJS).
const baseResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolveWith = baseResolve ?? context.resolveRequest;
  const res = resolveWith(context, moduleName, platform);
  if (
    platform === "web" &&
    res &&
    res.type === "sourceFile" &&
    res.filePath.includes("/zustand/esm/")
  ) {
    return {
      ...res,
      filePath: res.filePath
        .replace("/zustand/esm/", "/zustand/")
        .replace(/\.mjs$/, ".js"),
    };
  }
  return res;
};

module.exports = config;
