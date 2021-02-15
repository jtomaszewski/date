import moment from "moment-timezone";
import { DateRange } from "./DateRange";
import { LocalDate } from "./LocalDate";
import {
  RecurringDateFrequency,
  RecurringDateInput,
  validateRecurringDateInput,
} from "./RecurringDateInput";

export function formatRecurringDateFrequency(
  frequency: RecurringDateFrequency,
  _opts: {
    type?: "/FF";
  } = {}
): string {
  switch (frequency) {
    case "daily":
      return "/day";
    case "weekly":
      return "/wk";
    case "fortnightly":
      return "/fn";
    case "monthly":
      return "/mo";
    case "annually":
      return "/yr";
    default:
      throw new TypeError(`Unknown frequency: ${frequency}`);
  }
}

export class RecurringDate {
  private input: Readonly<RecurringDateInput>;

  constructor(input: Readonly<RecurringDateInput>) {
    validateRecurringDateInput(input);
    this.input = input;
  }

  get frequency(): RecurringDateFrequency {
    return this.input.frequency;
  }

  getNextOccurrence(asOf: LocalDate = LocalDate.today()): LocalDate {
    if (this.input.frequency === "daily") {
      return asOf.add(1, "day");
    }

    let result = asOf;
    if (this.input.frequency === "fortnightly") {
      result = LocalDate.from(this.input.startDate);
    } else if (this.input.frequency === "weekly") {
      result = result.setDayOfWeek(this.input.anniversaryDay);
    } else {
      result = result.setDayOfMonth(this.input.anniversaryDay);
    }
    if (this.input.frequency === "annually") {
      result = result.setMonth(this.input.anniversaryMonth - 1);
    }

    const period: { number: number; unit: "week" | "month" | "year" } =
      this.input.frequency === "weekly"
        ? { number: 1, unit: "week" }
        : this.input.frequency === "fortnightly"
        ? { number: 2, unit: "week" }
        : this.input.frequency === "monthly"
        ? { number: 1, unit: "month" }
        : { number: 1, unit: "year" };

    while (result.isSameOrBefore(asOf)) {
      result = result.add(period.number, period.unit);
    }

    return result;
  }

  /**
   * Gets next occurrence from `asOf`,
   * that is no later than on `end` (if `end` is given).
   */
  getNextOccurrenceNoLaterThan(
    end: LocalDate | undefined,
    asOf: LocalDate = LocalDate.today()
  ): LocalDate | undefined {
    const occurrence = this.getNextOccurrence(asOf);
    if (end && occurrence.isAfter(end)) {
      return undefined;
    }
    return occurrence;
  }

  /**
   * Gets list of occurrences that fall in the given date range (start and end inclusive).
   * Optionally, set how many occurrences are you interested in.
   *
   * If `dateRange` has no end date and `limit` is not given,
   * it will throw an error if the return value would exceed 100 elements.
   */
  getOccurrencesInDateRange(dateRange: DateRange, limit?: number): LocalDate[] {
    const result = [];
    let date = dateRange.start.subtract(1, "day");
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (limit !== undefined && result.length >= limit) {
        break;
      }
      if (limit === undefined && result.length > 100) {
        throw new Error(
          `getOccurrencesInDateRange() has been called with no \`limit\` while it would return more than 100 elements. Breaking...`
        );
      }
      if (dateRange.end && date.isSameOrAfter(dateRange.end)) {
        break;
      }
      date = this.getNextOccurrence(date);
      result.push(date);
    }
    return result;
  }

  format({ type = "X of Y" }: { type?: "X of Y" | "/FF" } = {}): string {
    if (type === "X of Y") {
      if (this.input.frequency === "weekly") {
        return `${moment()
          .isoWeekday(this.input.anniversaryDay)
          .format("dddd")} each week`;
      }

      if (this.input.frequency === "monthly") {
        return `${moment()
          .date(this.input.anniversaryDay)
          .format("Do")} of each month`;
      }

      if (this.input.frequency === "annually" && this.input.anniversaryMonth) {
        return `${moment()
          .date(this.input.anniversaryDay)
          .month(this.input.anniversaryMonth - 1)
          .format("Do MMMM")} each year`;
      }
    }

    if (type === "/FF") {
      return formatRecurringDateFrequency(this.frequency);
    }

    throw new TypeError("Not implemented");
  }
}
