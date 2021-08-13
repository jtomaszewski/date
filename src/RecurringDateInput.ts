import { LocalDate } from "./LocalDate";

export type RecurringDateFrequency =
  | "daily"
  | "weekly"
  | "fortnightly"
  | "monthly"
  | "annually";
export interface DailyRecurringDateInput {
  frequency: "daily";
}

export interface WeeklyRecurringDateInput {
  frequency: "weekly";
  /**
   * In range 1-7 (1 = Monday, 7 = Sunday).
   */
  anniversaryDay: number;
}
export interface RecurringDateInputWithStartDate {
  frequency: RecurringDateFrequency;
  startDate: LocalDate | string;
}

export interface MonthlyRecurringDateInput {
  frequency: "monthly";
  /**
   * In range 1-31.
   */
  anniversaryDay: number;
}

export interface AnnuallyRecurringDateInput {
  frequency: "annually";
  /**
   * In range 1-31.
   */
  anniversaryDay: number;
  /**
   * In range 1-12.
   */
  anniversaryMonth: number;
}

export type RecurringDateInput =
  | DailyRecurringDateInput
  | WeeklyRecurringDateInput
  | RecurringDateInputWithStartDate
  | MonthlyRecurringDateInput
  | AnnuallyRecurringDateInput;

export function getValidAnchorDate(data: {
  frequency: RecurringDateFrequency;
  startDate?: LocalDate | string | null;
  anniversaryDay?: number | null;
  anniversaryMonth?: number | null;
}): LocalDate {
  const { frequency, startDate, anniversaryDay, anniversaryMonth } = data;

  if (startDate) {
    return LocalDate.from(startDate);
  }

  const baseDate = new LocalDate("2020-01-01");

  if (frequency === "daily") {
    return baseDate;
  }

  if (frequency === "fortnightly") {
    throw new TypeError(
      "Fortnightly recurrences can only be calculated if a start date is provided"
    );
  }

  if (!anniversaryDay) {
    throw new TypeError("Start date nor anniversary day not provided");
  }

  if (frequency === "weekly") {
    if (anniversaryDay < 1 || anniversaryDay > 7) {
      throw new TypeError(
        `Weekly frequency must have anniversaryDay between [1,7]`
      );
    }
    return baseDate.setDayOfWeek(anniversaryDay);
  }

  if (anniversaryDay < 1 || anniversaryDay > 31) {
    throw new TypeError(`anniversaryDay must between [1,31]`);
  }

  if (frequency === "monthly") {
    return baseDate.setDayOfMonth(anniversaryDay);
  }

  if (!anniversaryMonth || anniversaryMonth < 1 || anniversaryMonth > 12) {
    throw new TypeError(`anniversaryMonth must be between [1,12]`);
  }

  const generatedStartDate = baseDate
    .setMonth(anniversaryMonth - 1)
    .setDayOfMonth(anniversaryDay);

  if (
    generatedStartDate.month !== anniversaryMonth - 1 ||
    generatedStartDate.dayOfMonth !== anniversaryDay
  ) {
    throw new TypeError(`must provide valid month/day combination`);
  }

  return generatedStartDate;
}
