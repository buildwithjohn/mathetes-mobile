/** @type {import('jest').Config} */
// Unit tests cover pure logic (formatting, privacy resolution, type scales).
// Tests import only dependency-free modules, so the jest-expo preset is enough
// without extra native mocks.
module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Tests live under src/ only. Files in app/ are bundled as routes by Expo
  // Router's require.context, so test files (and their Node-only deps) must not
  // be colocated there.
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
};
