import { render, fireEvent } from "@testing-library/react-native";

// Screen tests live outside app/ so Expo Router's require.context does not pull
// them (and their test-only deps) into the app bundle.

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: View,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

import Welcome from "../../app/(onboarding)/welcome";

describe("Welcome screen", () => {
  beforeEach(() => mockPush.mockClear());

  it("renders the brand and value proposition", () => {
    const { getByText } = render(<Welcome />);
    expect(getByText("Mathetes")).toBeTruthy();
    expect(getByText("Follow daily.")).toBeTruthy();
  });

  it("routes to sign up and sign in", () => {
    const { getByText } = render(<Welcome />);
    fireEvent.press(getByText("Create account"));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/signup");
    fireEvent.press(getByText("I already have an account"));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/signin");
  });
});
