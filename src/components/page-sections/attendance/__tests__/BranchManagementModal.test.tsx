import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BranchManagementModal,
  parseGoogleMapsUrlOrText,
} from "../BranchManagementModal";
import type { BranchOffice } from "@/types/branch";

// Mock google maps js api loader
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
    id: "branch-1",
    name: "Dr. Meoww Malang 1",
    address: "Jl. MT Haryono 10",
    lat: -8.0097357,
    lng: 112.6106983,
    radius: 100,
    is_active: true,
  },
  {
    id: "branch-2",
    name: "Dr. Meoww Malang 2",
    address: "Jl. Soekarno Hatta 20",
    lat: -7.9500000,
    lng: 112.6200000,
    radius: 150,
    is_active: true,
  },
];

describe("parseGoogleMapsUrlOrText utility", () => {
  it("detects shortlinks and sets isShortlink flag", () => {
    const res = parseGoogleMapsUrlOrText("https://maps.app.goo.gl/2EnbUaGr2NP7sveu9");
    expect(res.isShortlink).toBe(true);
    expect(res.lat).toBeNull();
    expect(res.lng).toBeNull();
  });

  it("extracts exact coordinates and place name from full Google Maps place URLs", () => {
    const url =
      "https://www.google.com/maps/place/Dr.Meoww+Cabang+3+-+Grooming+dan+Penitipan+Kucing+Malang/@-8.0027375,112.6894838,15z/data=!3m1!4b1!4m6!3m5!1s0x2dd629f0af156153:0x1fe73b11aa668abc!8m2!3d-8.0027589!4d112.6997836";
    const res = parseGoogleMapsUrlOrText(url);
    expect(res.lat).toBe("-8.0027589");
    expect(res.lng).toBe("112.6997836");
    expect(res.placeName).toBe("Dr.Meoww Cabang 3 - Grooming dan Penitipan Kucing Malang");
    expect(res.isShortlink).toBe(false);
  });

  it("extracts coordinates from ?q= parameter", () => {
    const url = "https://maps.google.com/?q=-8.00973,112.61069";
    const res = parseGoogleMapsUrlOrText(url);
    expect(res.lat).toBe("-8.00973");
    expect(res.lng).toBe("112.61069");
  });

  it("extracts coordinates from @lat,lng format", () => {
    const url = "https://www.google.com/maps/@-8.0027375,112.6894838,15z";
    const res = parseGoogleMapsUrlOrText(url);
    expect(res.lat).toBe("-8.0027375");
    expect(res.lng).toBe("112.6894838");
  });

  it("extracts raw comma-separated coordinates", () => {
    const res = parseGoogleMapsUrlOrText("-8.0027589, 112.6997836");
    expect(res.lat).toBe("-8.0027589");
    expect(res.lng).toBe("112.6997836");
  });

  it("safely handles empty or malformed strings", () => {
    expect(parseGoogleMapsUrlOrText("").lat).toBeNull();
    expect(parseGoogleMapsUrlOrText("alamat acak tanpa koordinat").lat).toBeNull();
  });
});

describe("BranchManagementModal Component", () => {
  const onBranchesUpdated = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal with list of branches", () => {
    render(
      <BranchManagementModal
        isOpen={true}
        onClose={onClose}
        branches={mockBranches}
        onBranchesUpdated={onBranchesUpdated}
      />
    );

    expect(screen.getByText("Kelola Lokasi Kantor Cabang")).toBeInTheDocument();
    expect(screen.getByText("Dr. Meoww Malang 1")).toBeInTheDocument();
    expect(screen.getByText("Dr. Meoww Malang 2")).toBeInTheDocument();
  });

  it("opens add form when 'Tambah Cabang' button is clicked", () => {
    render(
      <BranchManagementModal
        isOpen={true}
        onClose={onClose}
        branches={mockBranches}
        onBranchesUpdated={onBranchesUpdated}
      />
    );

    const addButton = screen.getByRole("button", { name: /Tambah Cabang/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/Pintasan Cepat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Cabang/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Longitude/i)).toBeInTheDocument();
  });

  it("auto-fills latitude and longitude when raw coordinates are pasted into quick input", () => {
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
    fireEvent.change(quickInput, { target: { value: "-8.0027589, 112.6997836" } });

    const latInput = screen.getByLabelText(/Latitude/i) as HTMLInputElement;
    const lngInput = screen.getByLabelText(/Longitude/i) as HTMLInputElement;

    expect(latInput.value).toBe("-8.0027589");
    expect(lngInput.value).toBe("112.6997836");
    expect(screen.getByText(/Koordinat Terisi:/i)).toBeInTheDocument();
  });

  it("resolves shortlink via fetch and populates coordinates & place name", async () => {
    const resolvedUrl =
      "https://www.google.com/maps/place/Dr.Meoww+Cabang+3+-+Grooming+dan+Penitipan+Kucing+Malang/@-8.0027375,112.6894838,15z/data=!3m1!4b1!4m6!3m5!1s0x2dd629f0af156153:0x1fe73b11aa668abc!8m2!3d-8.0027589!4d112.6997836";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ resolvedUrl }),
      })
    );

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

    await waitFor(() => {
      const latInput = screen.getByLabelText(/Latitude/i) as HTMLInputElement;
      expect(latInput.value).toBe("-8.0027589");
    });

    const lngInput = screen.getByLabelText(/Longitude/i) as HTMLInputElement;
    expect(lngInput.value).toBe("112.6997836");

    const nameInput = screen.getByLabelText(/Nama Cabang/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Dr.Meoww Cabang 3 - Grooming dan Penitipan Kucing Malang");
  });
});
