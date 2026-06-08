import { render } from "@testing-library/react-native";
import { Avatar } from "@/components/Avatar";

describe("Avatar", () => {
  it("shows initials when there is no photo", () => {
    const { getByText } = render(<Avatar name="Ada Lovelace" />);
    expect(getByText("AL")).toBeTruthy();
  });

  it("falls back to a placeholder for an empty name", () => {
    const { getByText } = render(<Avatar name="" />);
    expect(getByText("?")).toBeTruthy();
  });

  it("renders the photo (not initials) when a url is given", () => {
    const { queryByText } = render(
      <Avatar name="Ada Lovelace" photoUrl="https://example.com/a.png" />
    );
    expect(queryByText("AL")).toBeNull();
  });
});
