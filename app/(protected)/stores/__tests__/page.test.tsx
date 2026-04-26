import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StoresPage from "../page";
import { api } from "@/lib/api";
import type { PageResponse, ThriftStore } from "@/types/index";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/stores"
}));

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn()
  }
}));

const mockedApi = api as jest.Mocked<typeof api>;

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("StoresPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads all stores with newest sort by default", async () => {
    const allStores: PageResponse<ThriftStore> = {
      items: [
        {
          id: "store-1",
          name: "Loja física",
          addressLine: "Av. Paulista, 1000",
          createdAt: new Date().toISOString()
        }
      ],
      page: 0,
      hasNext: false
    };

    mockedApi.get.mockResolvedValue(allStores);

    renderWithClient(<StoresPage />);

    expect(await screen.findByText("Loja física")).toBeInTheDocument();
    expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/stores?page=0&pageSize=20&sort=newest");
  });

  it("switches to the admin online-only endpoint and preserves search, sort, and badge filters", async () => {
    const allStores: PageResponse<ThriftStore> = {
      items: [
        {
          id: "store-1",
          name: "Loja física",
          addressLine: "Av. Paulista, 1000",
          createdAt: new Date().toISOString()
        }
      ],
      page: 0,
      hasNext: false
    };

    const onlineStores: PageResponse<ThriftStore> = {
      items: [
        {
          id: "store-2",
          name: "Loja online",
          isOnlineStore: true,
          createdAt: new Date().toISOString()
        }
      ],
      page: 0,
      hasNext: false
    };

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path.startsWith("/dashboard/stores/online")) return onlineStores;
      return allStores;
    });

    renderWithClient(<StoresPage />);

    expect(await screen.findByText("Loja física")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Filtrar tipo de brechó"), "ONLINE_ONLY");
    await userEvent.selectOptions(screen.getByLabelText("Filtrar por badge"), "AMBASSADOR");
    await userEvent.selectOptions(screen.getByLabelText("Ordenar brechós"), "name_desc");
    await userEvent.type(screen.getByLabelText("Buscar brechós"), "vintage");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(await screen.findByRole("link", { name: "Loja online" })).toBeInTheDocument();
    expect(screen.getAllByText("Loja online")).toHaveLength(2);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        "/dashboard/stores/online?page=0&pageSize=20&sort=name_desc&search=vintage&badge=AMBASSADOR"
      );
    });
  });
});
