import { LocalDate } from "./LocalDate";

interface RecurrenceDetails {
  asOf: LocalDate;
  frequency: "daily" | "weekly" | "fortnightly" | "monthly" | "annually";
  /**
   * startDate is used only for fortnightly recurrences
   */
  startDate?: LocalDate | null;
  /**
   * anniversaryDay is used only for weekly, monthly and annual recurrences
   * If frequency === "weekly", must be in range 1-7 (1=Monday, 7=Sunday).
   * Otherwise, in range 1-28.
   */
  anniversaryDay?: number | null;
  /**
   * anniversaryMonth is used only for annual recurrences
   * In range 1-12
   */
  anniversaryMonth?: number | null;
}

export function getNextRecurringDate(input: RecurrenceDetails): LocalDate {
  if (input.frequency === "daily") {
    return input.asOf.add(1, "day");
  }

  validateInput(input);

  const {
    asOf,
    frequency,
    startDate,
    anniversaryDay,
    anniversaryMonth,
  } = input;

  let result = asOf;

  // Non-null assertions are valid because of `validateInput`
  if (frequency === "fortnightly") {
    result = startDate!;
  } else if (frequency === "weekly") {
    result = result.setDayOfWeek(anniversaryDay!);
  } else {
    result = result.setDayOfMonth(anniversaryDay!);
  }
  if (frequency === "annually") {
    result = result.setMonth(anniversaryMonth! - 1);
  }

  const period: { number: number; unit: "week" | "month" | "year" } =
    frequency === "weekly"
      ? { number: 1, unit: "week" }
      : frequency === "fortnightly"
      ? { number: 2, unit: "week" }
      : frequency === "monthly"
      ? { number: 1, unit: "month" }
      : { number: 1, unit: "year" };

  while (result.isSameOrBefore(asOf)) {
    result = result.add(period.number, period.unit);
  }

  return result;
}

function validateInput({
  frequency,
  startDate,
  anniversaryDay,
  anniversaryMonth,
}: RecurrenceDetails): void {
  if (frequency === "fortnightly") {
    if (!startDate) {
      throw new Error(
        "Fortnightly recurrences can only be calculated if a start date is provided"
      );
    }
    return;
  }

  if (!anniversaryDay) {
    throw new Error(
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
    throw new Error(
      `Annually frequency must have integer anniversaryMonth in [1, 12]`
    );
  }

  if (anniversaryDay < 1 || anniversaryDay % 1 !== 0) {
    throw new Error(`anniversaryDay must be a positive integer`);
  }

  if (frequency === "weekly" && anniversaryDay > 7) {
    throw new Error(`Weekly frequency must have anniversaryDay <= 7`);
  }

  if (anniversaryDay > 28) {
    throw new Error(`anniversaryDay must be less than or equal to 28`);
  }
}
