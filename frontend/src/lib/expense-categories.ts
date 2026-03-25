export const EXPENSE_CATEGORIES = [
  "Food",
  "Groceries",
  "Rent",
  "Utilities",
  "Internet",
  "Transport",
  "Cleaning",
  "Maintenance",
  "Entertainment",
  "Other",
] as const;

export function isPresetExpenseCategory(category: string) {
  return EXPENSE_CATEGORIES.includes(
    category as (typeof EXPENSE_CATEGORIES)[number]
  );
}
