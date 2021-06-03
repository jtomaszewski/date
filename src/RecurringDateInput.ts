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
    const localStartDate = LocalDate.from(startDate);
    if (
      (frequency === "monthly" || frequency === "annually") &&
      localStartDate.dayOfMonth > 28
    ) {
      throw new TypeError(`anniversaryDay must be less than or equal to 28`);
    }
    return localStartDate;
  }

  if (frequency === "daily") {
    return LocalDate.today();
  }

  if (frequency === "fortnightly") {
    throw new TypeError(
      "Fortnightly recurrences can only be calculated if a start date is provided"
    );
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
      `Annual frequency must have integer anniversaryMonth in [1, 12]`
    );
  }

  if (frequency === "weekly" && anniversaryDay > 7) {
    throw new TypeError(`Weekly frequency must have anniversaryDay <= 7`);
  }

  if (anniversaryDay > 28) {
    throw new TypeError(`anniversaryDay must be less than or equal to 28`);
  }

  const generatedStartDate =
    frequency === "weekly"
      ? LocalDate.today().setDayOfWeek(anniversaryDay)
      : frequency === "monthly"
      ? LocalDate.today().setDayOfMonth(anniversaryDay)
      : LocalDate.today()
          .setDayOfMonth(anniversaryDay)
          .setMonth(anniversaryMonth! - 1);

  return generatedStartDate;
}
