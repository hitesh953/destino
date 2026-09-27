/* eslint-env node */
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.transformer.getTransformOptions = async () => ({
  transform: {
    // Inline requires are very useful for deferring loading of large dependencies/components.
    // For example, we use it in app.tsx to conditionally load Reactotron.
    // However, this comes with some gotchas.
    // Read more here: https://reactnative.dev/docs/optimizing-javascript-loading
    // And here: https://github.com/expo/expo/issues/27279#issuecomment-1971610698
    inlineRequires: true,
  },
})

// This is a temporary fix that helps fixing an issue with axios/apisauce.
// See the following issues in Github for more details:
// https://github.com/infinitered/apisauce/issues/331
// https://github.com/axios/axios/issues/6899
// The solution was taken from the following issue:
// https://github.com/facebook/metro/issues/1272
config.resolver.unstable_conditionNames = ["require", "default", "browser"]

// This helps support certain popular third-party libraries
// such as Firebase that use the extension cjs.
config.resolver.sourceExts.push("cjs")

// @firebase/auth needs the "react-native" export condition to resolve its
// AsyncStorage-backed persistence layer (getReactNativePersistence). Without
// it, auth state doesn't survive app restarts even though sign-in succeeds.
// We can't add "react-native" to unstable_conditionNames globally (that's
// exactly what the axios/apisauce fix above disables), so this only widens
// the condition list for firebase/auth's own resolution.
const { resolveRequest: defaultResolveRequest } = config.resolver
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "firebase/auth" || moduleName.startsWith("@firebase/auth")) {
    return context.resolveRequest(
      { ...context, unstable_conditionNames: ["react-native", "require", "default"] },
      moduleName,
      platform,
    )
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform)
}

module.exports = config
