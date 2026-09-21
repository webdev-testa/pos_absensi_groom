import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BranchManagementModal,
} from "../BranchManagementModal";
import type { BranchOffice } from "@/types/branch";
import { isValidCoordinate } from "@/utils/geofence.utils";

// Mock google maps loader
vi.mock("@googlemaps/js-api-loader", () => ({
  setOptions: vi.fn(),
  importLibrary: vi.fn().mockImplementation(async (lib: string) => {
    if (lib === "maps") {
      return {
        Map: class {
          panTo = vi.fn();
          setZoom = vi.fn();
          addListener = vi.fn();
        },
      };
    }
    if (lib === "marker") {
      return {
        AdvancedMarkerElement: class {
          map = null;
          position = { lat: 0, lng: 0 };
          addListener = vi.fn();
          constructor(opts?: any) {
            if (opts) Object.assign(this, opts);
          }
        },
      };
    }
    return {};
  }),
}));

const mockBranches: BranchOffice[] = [
  {
    id: "branch-test-1",
    name: "Dr. Meoww Pusat",
    address: "Jl. Malang No. 1",
    lat: -8.0097357,
    lng: 112.6106983,
    radius: 100,
    is_active: true,
  },
];

describe("Red-Team Regression Tests - Branch Location & Link Resolution Protections", () => {
  const onBranchesUpdated = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Defect 1 & 5: isValidCoordinate correctly blocks out-of-range coordinates (>90 lat, >180 lng, NaN)", () => {
    expect(isValidCoordinate(999, 999)).toBe(false);
    expect(isValidCoordinate(-91, 100)).toBe(false);
    expect(isValidCoordinate(10, 185)).toBe(false);
    expect(isValidCoordinate(NaN, 112.61)).toBe(false);
    expect(isValidCoordinate(-8.0097, NaN)).toBe(false);
    expect(isValidCoordinate(-8.0097, 112.6106)).toBe(true);
  });

  it("Defect 2: Prevents DOM XSS via javascript: pseudo-protocol in fallback links", () => {
    render(
      <BranchManagementModal
        isOpen={true}
        onClose={onClose}
        branches={mockBranches}
        onBranchesUpdated={onBranchesUpdated}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Tambah Cabang/i }));

    const quickInput = screen.getByPlaceholderText(/Contoh: https:\/\/maps\.app\.goo\.gl/i);
    // Malicious payload attempting javascript injection
    fireEvent.change(quickInput, {
      target: { value: "javascript:alert(1);//https://maps.app.goo.gl" },
    });

    // The component should NOT render a dangerous link with javascript: href
    const dangerousLink = document.querySelector('a[href^="javascript:"]');
    expect(dangerousLink).toBeNull();
  });

  it("Defect 3: Disables submit button while shortlink resolution is in-flight", async () => {
    let resolvePromise: (val: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.stubGlobal("fetch", vi.fn().mockReturnValue(fetchPromise));

    render(
      <BranchManagementModal
        isOpen={true}
        onClose={onClose}
        branches={mockBranches}
        onBranchesUpdated={onBranchesUpdated}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Tambah Cabang/i }));

    const quickInput = screen.getByPlaceholderText(/Contoh: https:\/\/maps\.app\.goo\.gl/i);
    fireEvent.change(quickInput, {
      target: { value: "https://maps.app.goo.gl/2EnbUaGr2NP7sveu9" },
    });

    // While resolving, submit button must be disabled and show "Mengekstrak..."
    const submitBtn = screen.getByRole("button", { name: /Mengekstrak.../i });
    expect(submitBtn).toBeDisabled();

    // Now resolve fetch
    resolvePromise!({
      ok: true,
      json: async () => ({
        resolvedUrl:
          "https://www.google.com/maps/place/Dr.Meoww+Cabang+3/@-8.0027375,112.6894838,15z/data=!3m1!4b1!4m6!3m5!1s0x2dd629f0af156153:0x1fe73b11aa668abc!8m2!3d-8.0027589!4d112.6997836",
      }),
    });

    await waitFor(() => {
      expect(screen.queryByText(/Mengekstrak.../i)).toBeNull();
    });
  });

  it("Defect 4: BranchMiniMapPicker renders safely without crash when lat or lng is NaN", () => {
    render(
      <BranchManagementModal
        isOpen={true}
        onClose={onClose}
        branches={mockBranches}
        onBranchesUpdated={onBranchesUpdated}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Tambah Cabang/i }));

    const latInput = screen.getByLabelText(/Latitude/i);
    fireEvent.change(latInput, { target: { value: "not-a-number" } });

    // Should not throw and modal should still be visible
    expect(screen.getByText("Peta Titik Cabang (Klik pada peta atau geser pin)")).toBeInTheDocument();
  });

  it("Defect 6: Concurrency protection ignores out-of-order responses from older requests", async () => {
    let resolveFirst: (val: any) => void;
    let resolveSecond: (val: any) => void;

    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const secondPromise = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    vi.stubGlobal("fetch", mockFetch);

    render(
      <BranchManagementModal
        isOpen={true}
        onClose={onClose}
        branches={mockBranches}
        onBranchesUpdated={onBranchesUpdated}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Tambah Cabang/i }));

    const quickInput = screen.getByPlaceholderText(/Contoh: https:\/\/maps\.app\.goo\.gl/i);

    // First request
    fireEvent.change(quickInput, {
      target: { value: "https://maps.app.goo.gl/firstUrl" },
    });

    // Second request immediately after
    fireEvent.change(quickInput, {
      target: { value: "https://maps.app.goo.gl/secondUrl" },
    });

    // Resolve second request first (out-of-order)
    resolveSecond!({
      ok: true,
      json: async () => ({
        resolvedUrl:
          "https://www.google.com/maps/place/Cabang+Second/@-8.002,112.699,15z/data=!4m6!3m5!1s0x0!8m2!3d-8.0022222!4d112.6999999",
      }),
    });

    await waitFor(() => {
      const latInput = screen.getByLabelText(/Latitude/i) as HTMLInputElement;
      expect(latInput.value).toBe("-8.0022222");
    });

    // Now resolve first request late - it MUST NOT overwrite the second result!
    resolveFirst!({
      ok: true,
      json: async () => ({
        resolvedUrl:
          "https://www.google.com/maps/place/Cabang+First/@-8.001,112.611,15z/data=!4m6!3m5!1s0x0!8m2!3d-8.0011111!4d112.6111111",
      }),
    });

    // Verify coordinates remain from second request
    const latInput = screen.getByLabelText(/Latitude/i) as HTMLInputElement;
    expect(latInput.value).toBe("-8.0022222");
  });
});
