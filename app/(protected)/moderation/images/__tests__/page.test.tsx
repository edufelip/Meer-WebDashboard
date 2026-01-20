import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ModerationImagesPage from "../page";
import { api } from "@/lib/api";
import type { ImageModeration, ModerationPageResponse, ModerationStats } from "@/types/index";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn() }),
  usePathname: () => "/moderation/images"
}));

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn()
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

describe("ModerationImagesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reviews a flagged image via modal", async () => {
    const stats: ModerationStats = {
      pending: 0,
      processing: 0,
      flaggedForReview: 1,
      blocked: 0,
      approved: 0,
      failed: 0,
      total: 1
    };

    const item: ImageModeration = {
      id: 101,
      imageUrl: "https://example.com/image.jpg",
      status: "FLAGGED_FOR_REVIEW",
      entityType: "USER_AVATAR",
      entityId: "user-123",
      nsfwScore: 0.55,
      createdAt: new Date().toISOString(),
      retryCount: 0
    };

    const flaggedResponse: ModerationPageResponse<ImageModeration> = {
      content: [item],
      page: 0,
      hasNext: false
    };

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path.includes("/dashboard/moderation/stats")) return stats;
      if (path.includes("/dashboard/moderation/flagged")) return flaggedResponse;
      return { content: [], page: 0, hasNext: false } as ModerationPageResponse<ImageModeration>;
    });

    mockedApi.patch.mockResolvedValue({ ...item, status: "MANUALLY_APPROVED" } as ImageModeration);

    renderWithClient(<ModerationImagesPage />);

    expect(await screen.findByText("Imagens")).toBeInTheDocument();

    const reviewButton = await screen.findByRole("button", { name: /revisar/i });
    await userEvent.click(reviewButton);

    expect(await screen.findByText(/imagem #101/i)).toBeInTheDocument();

    const approveButton = screen.getByRole("button", { name: /aprovar/i });
    await userEvent.click(approveButton);

    expect(mockedApi.patch).toHaveBeenCalledWith("/dashboard/moderation/101/review", {
      decision: "MANUALLY_APPROVED",
      notes: undefined
    });
  });

  it("rejects a flagged image with optional notes", async () => {
    const stats: ModerationStats = {
      pending: 0,
      processing: 0,
      flaggedForReview: 1,
      blocked: 0,
      approved: 0,
      failed: 0,
      total: 1
    };

    const item: ImageModeration = {
      id: 202,
      imageUrl: "https://example.com/image-2.jpg",
      status: "FLAGGED_FOR_REVIEW",
      entityType: "STORE_PHOTO",
      entityId: "store-999",
      nsfwScore: 0.62,
      createdAt: new Date().toISOString(),
      retryCount: 1
    };

    const flaggedResponse: ModerationPageResponse<ImageModeration> = {
      content: [item],
      page: 0,
      hasNext: false
    };

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path.includes("/dashboard/moderation/stats")) return stats;
      if (path.includes("/dashboard/moderation/flagged")) return flaggedResponse;
      return { content: [], page: 0, hasNext: false } as ModerationPageResponse<ImageModeration>;
    });

    mockedApi.patch.mockResolvedValue({ ...item, status: "MANUALLY_REJECTED" } as ImageModeration);

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    renderWithClient(<ModerationImagesPage />);

    const reviewButton = await screen.findByRole("button", { name: /revisar/i });
    await userEvent.click(reviewButton);

    const notesField = await screen.findByPlaceholderText(/opcional/i);
    await userEvent.type(notesField, "Conteúdo inadequado.");

    const rejectButton = screen.getByRole("button", { name: /rejeitar/i });
    await userEvent.click(rejectButton);

    expect(mockedApi.patch).toHaveBeenCalledWith("/dashboard/moderation/202/review", {
      decision: "MANUALLY_REJECTED",
      notes: "Conteúdo inadequado."
    });

    confirmSpy.mockRestore();
  });

  it("loads history with status filter", async () => {
    const stats: ModerationStats = {
      pending: 0,
      processing: 0,
      flaggedForReview: 0,
      blocked: 2,
      approved: 4,
      failed: 0,
      total: 6
    };

    const blockedItem: ImageModeration = {
      id: 303,
      imageUrl: "https://example.com/image-3.jpg",
      status: "BLOCKED",
      entityType: "GUIDE_CONTENT_IMAGE",
      entityId: "content-777",
      nsfwScore: 0.91,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      retryCount: 0
    };

    const historyResponse: ModerationPageResponse<ImageModeration> = {
      content: [blockedItem],
      page: 0,
      hasNext: false
    };

    mockedApi.get.mockImplementation(async (path: string) => {
      if (path.includes("/dashboard/moderation/stats")) return stats;
      if (path.includes("/dashboard/moderation?page=0") && path.includes("status=BLOCKED")) return historyResponse;
      return { content: [], page: 0, hasNext: false } as ModerationPageResponse<ImageModeration>;
    });

    renderWithClient(<ModerationImagesPage />);

    const historyButton = await screen.findByRole("button", { name: /histórico/i });
    await userEvent.click(historyButton);

    const statusSelect = await screen.findByRole("combobox");
    await userEvent.selectOptions(statusSelect, "BLOCKED");

    const blockedBadges = await screen.findAllByText(/bloqueado/i);
    expect(blockedBadges.length).toBeGreaterThan(0);
    expect(await screen.findByText(/content-777/i)).toBeInTheDocument();
    expect(mockedApi.get).toHaveBeenCalledWith(
      "/dashboard/moderation?page=0&pageSize=20&status=BLOCKED"
    );
  });
});
