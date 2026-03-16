import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "@/app/auth/page";
import { AuthProvider } from "@/context/AuthContext";

// TC-01 – User Registration (frontend validation)

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthPage />
    </AuthProvider>
  );
}

// Helper: get the submit button (has type="submit"), not the tab button
function getSubmitButton() {
  const buttons = screen.getAllByRole("button");
  return buttons.find((b) => b.getAttribute("type") === "submit")!;
}

describe("Auth Page (TC-01)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render login form by default", () => {
    renderAuth();

    expect(screen.getByText("Welcome back")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(getSubmitButton().textContent).toBe("Log In");
  });

  it("should switch to register form when Sign Up tab is clicked", () => {
    renderAuth();

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText("Create your account")).toBeTruthy();
    expect(screen.getByLabelText("Full Name")).toBeTruthy();
  });

  it("should show validation error for empty email on login", async () => {
    renderAuth();

    // Submit with empty fields
    fireEvent.submit(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText("Email is required.")).toBeTruthy();
    });
  });

  it("should show validation error for invalid email format", async () => {
    renderAuth();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "bad-email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "SomePass1" },
    });

    fireEvent.submit(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    });
  });

  it("should show validation errors for weak password on register", async () => {
    renderAuth();

    // Switch to register mode
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "short" },
    });

    fireEvent.submit(getSubmitButton());

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters.")
      ).toBeTruthy();
    });
  });

  it("should show validation error for password without uppercase", async () => {
    renderAuth();

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "nouppercase1" },
    });

    fireEvent.submit(getSubmitButton());

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password must contain at least 1 uppercase letter."
        )
      ).toBeTruthy();
    });
  });

  it("should show validation error for password without number", async () => {
    renderAuth();

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "NoNumberHere" },
    });

    fireEvent.submit(getSubmitButton());

    await waitFor(() => {
      expect(
        screen.getByText("Password must contain at least 1 number.")
      ).toBeTruthy();
    });
  });

  it("should require name field during registration", async () => {
    renderAuth();

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "ValidPass1" },
    });

    fireEvent.submit(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText("Name is required.")).toBeTruthy();
    });
  });
});
