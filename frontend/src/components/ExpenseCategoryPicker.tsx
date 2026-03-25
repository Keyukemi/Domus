"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

interface ExpenseCategoryPickerProps {
  id: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

export default function ExpenseCategoryPicker({
  id,
  value,
  options,
  onChange,
}: ExpenseCategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="w-full min-h-12 px-4 py-3 rounded-lg border border-border text-left text-base text-text bg-bg outline-none focus:border-primary flex items-center justify-between gap-3"
      >
        <span>{value}</span>
        <FiChevronDown size={18} className="shrink-0 text-text-muted" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            className="relative w-full sm:max-w-md bg-bg-card border border-border-light rounded-t-3xl sm:rounded-2xl shadow-lg p-4 sm:p-5 max-h-[80vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 id={`${id}-title`} className="text-lg font-semibold text-text font-serif">
                  Choose category
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Pick the option that best matches this expense.
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-lg border border-border text-sm text-text hover:bg-bg-feature transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {options.map((option) => {
                const isSelected = option === value;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-4 text-left text-base transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5 text-text"
                        : "border-border-light bg-bg hover:bg-bg-feature text-text"
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && <FiCheck size={18} className="shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
