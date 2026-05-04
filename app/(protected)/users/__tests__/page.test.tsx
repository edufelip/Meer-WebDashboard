import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UsersPage from "../page";
import { api } from "@/lib/api";
import type { PageResponse, User } from "@/types/index";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/users"
}));

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn()
  }
}));

const mockedApi = api as jest.Mocked<typeof api>;

type UsersPageResponse = PageResponse<User> & {
  total: number;
};

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("UsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the total number of users returned by the API", async () => {
    const users: UsersPageResponse = {
      items: [
        {
          id: "user-1",
          name: "Jane User",
          email: "jane@example.com",
          role: "USER"
        }
      ],
      page: 0,
      hasNext: false,
      total: 1234
    };

    mockedApi.get.mockResolvedValue(users);

    renderWithClient(<UsersPage />);

    expect(await screen.findByText("Total de usuários: 1.234")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jane User" })).toBeInTheDocument();
    expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/users?page=0&pageSize=20&sort=newest");
  });
});
