import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StoreDetailPage from "../page";
import { api } from "@/lib/api";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "new" }),
  useRouter: () => ({ back: jest.fn(), replace: replaceMock, push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/stores/new"
}));

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn()
  }
}));

jest.mock("@/components/stores/StoreBadgesCard", () => ({
  StoreBadgesCard: () => null
}));

jest.mock("@/components/stores/StoreOwnerCard", () => ({
  StoreOwnerCard: () => null
}));

jest.mock("@/components/stores/StorePhotosCard", () => ({
  StorePhotosCard: () => <div>photos</div>
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

describe("StoreDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    replaceMock.mockReset();
  });

  it("hides address fields and submits cleared address payload for online-only stores", async () => {
    mockedApi.post.mockResolvedValue({
      id: "store-created",
      name: "Loja online"
    } as any);

    renderWithClient(<StoreDetailPage />);

    expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/nome/i), "Loja online");
    await userEvent.type(screen.getByLabelText(/descrição/i), "Brechó sem endereço físico.");
    await userEvent.click(screen.getByLabelText(/loja online/i));

    expect(screen.queryByLabelText(/endereço/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/latitude/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/stores", {
        name: "Loja online",
        description: "Brechó sem endereço físico.",
        isOnlineStore: true,
        addressLine: null,
        complement: null,
        neighborhood: null,
        latitude: null,
        longitude: null
      });
    });

    expect(replaceMock).toHaveBeenCalledWith("/stores/store-created");
  });
});
