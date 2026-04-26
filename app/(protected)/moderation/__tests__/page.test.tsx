import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ModerationPage from "../page";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/moderation"
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

describe("ModerationPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows page 1 when the backend returns page 0", async () => {
    mockedApi.get.mockImplementation(async (path: string) => {
      if (path === "/dashboard/moderation/stats") {
        return {
          pending: 0,
          processing: 0,
          flaggedForReview: 0,
          blocked: 0,
          approved: 0,
          failed: 0,
          total: 0
        };
      }

      return {
        items: [],
        page: 0,
        hasNext: false
      };
    });

    renderWithClient(<ModerationPage />);

    expect(await screen.findByText(/página 1/i)).toBeInTheDocument();
  });
});
