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

function createTestClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
}

function renderWithClient(ui: React.ReactElement, client = createTestClient()) {
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("StoresPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads all stores with newest sort by default and fetches city options", async () => {
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

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path === "/dashboard/stores/cities") {
        return { items: ["Campinas", "São Paulo"] };
      }
      return allStores;
    });

    renderWithClient(<StoresPage />);

    expect(await screen.findByText("Loja física")).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "São Paulo" })).toBeInTheDocument();
    expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/stores/cities");
    expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/stores?page=0&pageSize=20&sort=newest");
  });

  it("applies city together with search, sort, and badge filters", async () => {
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

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path === "/dashboard/stores/cities") {
        return { items: ["Campinas", "São Paulo"] };
      }
      return allStores;
    });

    renderWithClient(<StoresPage />);

    expect(await screen.findByText("Loja física")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Filtrar por cidade"), "São Paulo");
    await userEvent.selectOptions(screen.getByLabelText("Filtrar por badge"), "AMBASSADOR");
    await userEvent.selectOptions(screen.getByLabelText("Ordenar brechós"), "name_desc");
    await userEvent.type(screen.getByLabelText("Buscar brechós"), "vintage");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        "/dashboard/stores?page=0&pageSize=20&sort=name_desc&search=vintage&badge=AMBASSADOR&city=S%C3%A3o%20Paulo"
      );
    });
  });

  it("resets pagination when the city filter changes", async () => {
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
      hasNext: true
    };

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path === "/dashboard/stores/cities") {
        return { items: ["Campinas", "São Paulo"] };
      }
      return allStores;
    });

    renderWithClient(<StoresPage />);

    expect(await screen.findByText("Loja física")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Próxima" }));

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/stores?page=1&pageSize=20&sort=newest");
    });

    await userEvent.selectOptions(screen.getByLabelText("Filtrar por cidade"), "São Paulo");

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/stores?page=0&pageSize=20&sort=newest&city=S%C3%A3o%20Paulo");
    });
  });

  it("switches to the admin online-only endpoint, clears city, and omits the city param", async () => {
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
      if (path === "/dashboard/stores/cities") {
        return { items: ["Campinas", "São Paulo"] };
      }
      if (path.startsWith("/dashboard/stores/online")) return onlineStores;
      return allStores;
    });

    renderWithClient(<StoresPage />);

    expect(await screen.findByText("Loja física")).toBeInTheDocument();

    const cityFilter = screen.getByLabelText("Filtrar por cidade");
    await userEvent.selectOptions(cityFilter, "São Paulo");
    expect(cityFilter).toHaveValue("São Paulo");

    await userEvent.selectOptions(screen.getByLabelText("Filtrar tipo de brechó"), "ONLINE_ONLY");

    expect(await screen.findByRole("link", { name: "Loja online" })).toBeInTheDocument();
    expect(screen.getAllByText("Loja online")).toHaveLength(2);
    expect(screen.getByLabelText("Filtrar por cidade")).toHaveValue("ALL");
    expect(screen.getByLabelText("Filtrar por cidade")).toBeDisabled();

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/stores/online?page=0&pageSize=20&sort=newest");
    });
  });

  it("keeps the stores list usable when city options fail to load", async () => {
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

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path === "/dashboard/stores/cities") {
        throw new Error("cities failed");
      }
      return allStores;
    });

    renderWithClient(<StoresPage />);

    expect(await screen.findByText("Loja física")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por cidade")).toBeDisabled();
    expect(screen.getByRole("option", { name: "Todas as cidades" })).toBeInTheDocument();
  });

  it("keeps the city filter enabled when cached city options exist and a refetch fails", async () => {
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

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path === "/dashboard/stores/cities") {
        throw new Error("cities refetch failed");
      }
      return allStores;
    });

    const client = createTestClient();
    client.setQueryData(["store-cities"], { items: ["Campinas", "São Paulo"] });

    renderWithClient(<StoresPage />, client);

    expect(await screen.findByText("Loja física")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por cidade")).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "São Paulo" })).toBeInTheDocument();
  });
});
