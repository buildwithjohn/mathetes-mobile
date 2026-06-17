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

// Reanimated entering builders are no-ops here; render the plain RN primitives.
jest.mock("react-native-reanimated", () => {
  const { Text, View } = require("react-native");
  const chain = () => {
    const o: Record<string, unknown> = {};
    o.delay = () => o;
    o.duration = () => o;
    o.springify = () => o;
    return o;
  };
  return {
    __esModule: true,
    default: { Text, View, createAnimatedComponent: (c: unknown) => c },
    FadeIn: chain(),
    FadeInDown: chain(),
    FadeInUp: chain(),
  };
});

import Welcome from "../../app/(onboarding)/welcome";

describe("Welcome screen", () => {
  beforeEach(() => mockPush.mockClear());

  it("renders the brand and value proposition", () => {
    const { getByText } = render(<Welcome />);
    expect(getByText("mathetes")).toBeTruthy();
    expect(getByText("Follow daily")).toBeTruthy();
  });

  it("routes to sign up and sign in", () => {
    const { getByText } = render(<Welcome />);
    fireEvent.press(getByText("Begin"));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/signup");
    fireEvent.press(getByText("I already have an account"));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/signin");
  });
});
