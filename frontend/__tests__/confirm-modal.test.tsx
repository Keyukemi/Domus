import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "@/components/ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    title: "Delete Task",
    message: "Are you sure you want to delete this task?",
    confirmLabel: "Delete",
    variant: "danger" as const,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render title and message when open", () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText("Delete Task")).toBeTruthy();
    expect(
      screen.getByText("Are you sure you want to delete this task?")
    ).toBeTruthy();
  });

  it("should render nothing when closed", () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} isOpen={false} />
    );

    expect(container.innerHTML).toBe("");
  });

  it("should call onConfirm when confirm button is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when cancel button is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when Escape key is pressed", () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when clicking the backdrop", () => {
    render(<ConfirmModal {...defaultProps} />);

    // Click the outer overlay div (backdrop)
    const backdrop = screen.getByText("Delete Task").closest(".fixed");
    fireEvent.click(backdrop!);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("should NOT call onCancel when clicking inside the modal", () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByText("Delete Task"));

    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });
});
