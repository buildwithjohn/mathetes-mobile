/** @type {import('jest').Config} */
// Unit tests cover pure logic (formatting, privacy resolution, type scales).
// Tests import only dependency-free modules, so the jest-expo preset is enough
// without extra native mocks.
module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/app/**/*.test.{ts,tsx}",
  ],
};
