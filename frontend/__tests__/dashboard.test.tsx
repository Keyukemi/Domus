import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/context/AuthContext";

// TC-05 – Dashboard Data Aggregation (frontend)

// Mock apiFetch before importing DashboardPage
jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}));

import DashboardPage from "@/app/dashboard/page";
import { apiFetch } from "@/lib/api";

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockUser = {
  id: "user-1",
  email: "alice@domus.com",
  name: "Alice",
  role: "MEMBER",
  householdId: "household-1",
};

function renderDashboard() {
  // Seed localStorage so AuthProvider thinks user is logged in
  localStorage.setItem("accessToken", "fake-token");
  localStorage.setItem("user", JSON.stringify(mockUser));

  return render(
    <AuthProvider>
      <DashboardPage />
    </AuthProvider>
  );
}

function mockDashboardApi(dashData: Record<string, unknown>) {
  mockApiFetch.mockImplementation(async (path: string) => {
    if (path === "/api/dashboard") {
      return { ok: true, json: async () => dashData } as Response;
    }
    if (path.startsWith("/api/households/")) {
      return {
        ok: true,
        json: async () => ({ name: "Test Household" }),
      } as Response;
    }
    return { ok: false, json: async () => ({}) } as Response;
  });
}

describe("Dashboard Page (TC-05)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should display correct task count and balance", async () => {
    mockDashboardApi({
      pendingTasksCount: 5,
      upcomingDeadlines: [],
      myBalance: "25.00",
      recentExpenses: [],
      recentNotes: [],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("5")).toBeTruthy();
    });
    expect(screen.getByText("pending")).toBeTruthy();
    expect(screen.getByText("+$25.00")).toBeTruthy();
    expect(screen.getByText("You are owed")).toBeTruthy();
  });

  it("should display empty state when no tasks or expenses", async () => {
    mockDashboardApi({
      pendingTasksCount: 0,
      upcomingDeadlines: [],
      myBalance: "0.00",
      recentExpenses: [],
      recentNotes: [],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("0")).toBeTruthy();
    });
    expect(screen.getByText("$0.00")).toBeTruthy();
    expect(screen.getByText("All settled")).toBeTruthy();
    expect(screen.getByText("No upcoming or overdue tasks")).toBeTruthy();
    expect(screen.getByText("No expenses yet")).toBeTruthy();
    expect(screen.getByText("No notes yet")).toBeTruthy();
  });

  it("should show negative balance correctly", async () => {
    mockDashboardApi({
      pendingTasksCount: 1,
      upcomingDeadlines: [],
      myBalance: "-40.00",
      recentExpenses: [],
      recentNotes: [],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("You owe")).toBeTruthy();
    });
  });

  it("should show error message when API fails", async () => {
    mockApiFetch.mockImplementation(async () => {
      return {
        ok: false,
        status: 500,
        json: async () => ({ message: "Server error" }),
      } as Response;
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeTruthy();
    });
  });

  it("should let the user complete an upcoming task from the dashboard", async () => {
    let dashboardCalls = 0;

    mockApiFetch.mockImplementation(async (path: string, options?: RequestInit) => {
      if (path === "/api/dashboard") {
        dashboardCalls += 1;

        if (dashboardCalls === 1) {
          return {
            ok: true,
            json: async () => ({
              pendingTasksCount: 1,
              upcomingDeadlines: [
                {
                  id: "task-1",
                  title: "Take out recycling",
                  deadline: "2026-03-26T10:00:00.000Z",
                  assignees: [],
                },
              ],
              myBalance: "0.00",
              recentExpenses: [],
              recentNotes: [],
            }),
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({
            pendingTasksCount: 0,
            upcomingDeadlines: [],
            myBalance: "0.00",
            recentExpenses: [],
            recentNotes: [],
          }),
        } as Response;
      }

      if (path === "/api/tasks/task-1" && options?.method === "PATCH") {
        return { ok: true, json: async () => ({}) } as Response;
      }

      if (path.startsWith("/api/households/")) {
        return {
          ok: true,
          json: async () => ({ name: "Test Household" }),
        } as Response;
      }

      return { ok: false, json: async () => ({}) } as Response;
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Take out recycling")).toBeTruthy();
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: "Mark Take out recycling as complete",
      })
    );

    await waitFor(() => {
      expect(screen.getByText("0")).toBeTruthy();
    });

    expect(screen.getByText("No upcoming or overdue tasks")).toBeTruthy();
    expect(mockApiFetch).toHaveBeenCalledWith("/api/tasks/task-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "COMPLETED" }),
    });
  });

  it("should label overdue tasks clearly on the dashboard", async () => {
    mockDashboardApi({
      pendingTasksCount: 2,
      upcomingDeadlines: [
        {
          id: "task-overdue",
          title: "Pay electricity bill",
          deadline: "2020-01-01T10:00:00.000Z",
          assignees: [],
        },
      ],
      myBalance: "0.00",
      recentExpenses: [],
      recentNotes: [],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Pay electricity bill")).toBeTruthy();
    });

    expect(screen.getByText("Overdue")).toBeTruthy();
  });
});
