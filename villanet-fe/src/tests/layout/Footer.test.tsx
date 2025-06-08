import { cleanup, render, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Footer } from "../../components/layout/Footer";

describe("Footer", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 8));
  });

  afterAll(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders footer content correctly", () => {
    render(<Footer />);
    const expectedText = `© ${new Date().getFullYear()} VillaNet. All rights reserved.`;
    expect(screen.getByText(expectedText)).toBeTruthy();
  });
});
