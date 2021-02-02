import { LocalDate } from "./LocalDate";

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

export interface FortnightlyRecurringDateInput {
  frequency: "fortnightly";
  startDate: LocalDate | string;
}

export interface MonthlyRecurringDateInput {
  frequency: "monthly";
  /**
   * In range 1-28.
   */
  anniversaryDay: number;
}

export interface AnnuallyRecurringDateInput {
  frequency: "annually";
  /**
   * In range 1-28.
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
  | FortnightlyRecurringDateInput
  | MonthlyRecurringDateInput
  | AnnuallyRecurringDateInput;

export type RecurringDateFrequency = RecurringDateInput["frequency"];

export function validateRecurringDateInput(data: {
  frequency: RecurringDateFrequency;
  startDate?: LocalDate | string | null;
  anniversaryDay?: number | null;
  anniversaryMonth?: number | null;
}): RecurringDateInput {
  const { frequency, startDate, anniversaryDay, anniversaryMonth } = data;

  if (frequency === "fortnightly") {
    if (!startDate) {
      throw new TypeError(
        "Fortnightly recurrences can only be calculated if a start date is provided"
      );
    }
    return data as RecurringDateInput;
  }

  if (frequency === "daily") {
    return data as RecurringDateInput;
  }

  if (!anniversaryDay) {
    throw new TypeError(
      "Anniversary day is required for all recurrences except fortnightly ones"
    );
  }

  if (
    frequency === "annually" &&
    (!anniversaryMonth ||
      anniversaryMonth > 12 ||
      anniversaryMonth < 1 ||
      anniversaryMonth % 1 !== 0)
  ) {
    throw new TypeError(
      `Annually frequency must have integer anniversaryMonth in [1, 12]`
    );
  }

  if (anniversaryDay < 1 || anniversaryDay % 1 !== 0) {
    throw new TypeError(`anniversaryDay must be a positive integer`);
  }

  if (frequency === "weekly" && anniversaryDay > 7) {
    throw new TypeError(`Weekly frequency must have anniversaryDay <= 7`);
  }

  if (anniversaryDay > 28) {
    throw new TypeError(`anniversaryDay must be less than or equal to 28`);
  }

  return data as RecurringDateInput;
}
