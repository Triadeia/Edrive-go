export const WORKSPACE_TIME_ZONE = "America/Bahia";

type BahiaParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: WORKSPACE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function parts(value: string): BahiaParts {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid workspace date: ${value}`);
  const values = Object.fromEntries(
    partsFormatter.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return values as BahiaParts;
}

export function bahiaDateKey(value: string): string {
  const valueParts = parts(value);
  return `${valueParts.year}-${valueParts.month}-${valueParts.day}`;
}

export function bahiaWallClock(value: string): string {
  const valueParts = parts(value);
  return `${valueParts.year}-${valueParts.month}-${valueParts.day}T${valueParts.hour}:${valueParts.minute}`;
}

export function isoFromBahiaWallClock(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new RangeError(`Invalid Bahia wall-clock value: ${value}`);
  }
  const date = new Date(`${value}:00-03:00`);
  if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid Bahia wall-clock value: ${value}`);
  return date.toISOString();
}

export function moveBahiaDatePreservingTime(value: string, dateKey: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new RangeError(`Invalid date key: ${dateKey}`);
  const valueParts = parts(value);
  const moved = new Date(`${dateKey}T${valueParts.hour}:${valueParts.minute}:${valueParts.second}-03:00`);
  if (Number.isNaN(moved.getTime())) throw new RangeError(`Invalid moved workspace date: ${dateKey}`);
  return moved.toISOString();
}

export function formatBahiaDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: WORKSPACE_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatBahiaDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: WORKSPACE_TIME_ZONE,
    dateStyle: "short",
  }).format(new Date(value));
}
