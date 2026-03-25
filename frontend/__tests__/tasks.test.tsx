import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}));

import TasksPage from "@/app/tasks/page";
import { apiFetch } from "@/lib/api";

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockUser = {
  id: "user-1",
  email: "alice@domus.com",
  name: "Alice",
  role: "MEMBER",
  householdId: "household-1",
};

function renderTasksPage() {
  localStorage.setItem("accessToken", "fake-token");
  localStorage.setItem("user", JSON.stringify(mockUser));

  return render(
    <AuthProvider>
      <TasksPage />
    </AuthProvider>
  );
}

describe("Tasks Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should show an overdue badge for pending tasks past their deadline", async () => {
    mockApiFetch.mockImplementation(async (path: string) => {
      if (path === "/api/tasks") {
        return {
          ok: true,
          json: async () => [
            {
              id: "task-1",
              title: "Wash dishes",
              description: null,
              deadline: "2020-01-01T10:00:00.000Z",
              status: "PENDING",
              createdBy: mockUser,
              assignees: [],
              createdAt: "2020-01-01T08:00:00.000Z",
            },
          ],
        } as Response;
      }

      return { ok: false, json: async () => ({}) } as Response;
    });

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText("Wash dishes")).toBeTruthy();
    });

    expect(screen.getByText("Overdue")).toBeTruthy();
  });
});
