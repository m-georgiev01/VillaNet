import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Layout } from "../../components/layout/Layout";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

describe("Layout component", () => {
  it("renders Header, Main, and Footer components", () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByText("Login")).toBeTruthy();
    expect(screen.getByTestId("main")).toBeTruthy();
    expect(screen.getByTestId("footer")).toBeTruthy();
  });
});
