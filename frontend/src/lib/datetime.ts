export function getDefaultTaskDeadlineInputValue() {
  const now = new Date();
  now.setSeconds(0, 0);
  return formatDateForDatetimeLocal(now);
}

export function formatDateForDatetimeLocal(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function toIsoDateTime(value: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}
