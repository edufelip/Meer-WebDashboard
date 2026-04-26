import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CategoriesPage from "../page";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/categories"
}));

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn()
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

describe("CategoriesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows page 1 when the backend returns page 0", async () => {
    mockedApi.get.mockResolvedValue({
      items: [],
      page: 0,
      hasNext: false
    } as any);

    renderWithClient(<CategoriesPage />);

    expect(await screen.findByText(/página 1/i)).toBeInTheDocument();
  });
});
