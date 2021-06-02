import moment from "moment-timezone";
import { DateRange } from "./DateRange";
import { LocalDate } from "./LocalDate";
import {
  RecurringDateData,
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

const frequencyPeriodLength = {
  daily: { number: 1, unit: "day" },
  weekly: { number: 1, unit: "week" },
  fortnightly: { number: 2, unit: "week" },
  monthly: { number: 1, unit: "month" },
  annually: { number: 1, unit: "year" },
} as const;

export class RecurringDate {
  private data: Readonly<RecurringDateData>;

  constructor(input: Readonly<RecurringDateInput>) {
    this.data = validateRecurringDateInput(input);
  }

  get frequency(): RecurringDateFrequency {
    return this.data.frequency;
  }

  getNextOccurrence(
    asOf: LocalDate = LocalDate.today(),
    options: { inclusive?: boolean } = {}
  ): LocalDate {
    const { inclusive = false } = options;
    const period = frequencyPeriodLength[this.data.frequency];

    return this.getPreviousOccurrence(asOf, { inclusive: !inclusive }).add(
      period.number,
      period.unit
    );
  }

  getPreviousOccurrence(
    asOf: LocalDate = LocalDate.today(),
    options: { inclusive?: boolean } = {}
  ): LocalDate {
    const { inclusive = false } = options;
    const period = frequencyPeriodLength[this.data.frequency];

    if (!inclusive && this.hasOccurrenceOn(asOf)) {
      return asOf.subtract(period.number, period.unit);
    }

    const periodsToAdd = Math.floor(this.periodsToStartDate(asOf));
    return this.data.startDate.add(periodsToAdd * period.number, period.unit);
  }

  hasOccurrenceOn(date: LocalDate = LocalDate.today()): boolean {
    return Number.isInteger(this.periodsToStartDate(date));
  }

  private periodsToStartDate(date: LocalDate = LocalDate.today()): number {
    const period = frequencyPeriodLength[this.data.frequency];
    return date.diff(this.data.startDate, period.unit, true) / period.number;
  }

  /**
   * Gets next occurrence from `asOf`,
   * that is no later than on `end` (if `end` is given).
   */
  getNextOccurrenceInDateRange(
    dateRange: DateRange,
    asOf: LocalDate = LocalDate.today()
  ): LocalDate | undefined {
    const occurrence = this.getNextOccurrence(
      LocalDate.max(dateRange.start.subtract(1, "day"), asOf)
    );
    if (dateRange.end && occurrence.isAfter(dateRange.end)) {
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
      // eslint-disable-next-line default-case
      switch (this.data.frequency) {
        case "daily":
          return "Every day";

        case "fortnightly":
          return `Fortnightly starting with ${LocalDate.from(
            this.data.startDate
          ).format("D MMM YYYY")}`;

        case "weekly":
          return `${moment()
            .isoWeekday(this.data.startDate.getDayOfWeek())
            .format("dddd")} each week`;

        case "monthly":
          return `${moment()
            .date(this.data.startDate.getDayOfMonth())
            .format("Do")} of each month`;

        case "annually":
          return `${moment()
            .date(this.data.startDate.getDayOfMonth())
            .month(this.data.startDate.getMonth())
            .format("Do MMMM")} each year`;
      }
    }

    if (type === "/FF") {
      return formatRecurringDateFrequency(this.frequency);
    }

    throw new TypeError(
      ".format() not implemented for this recurring date input and format type"
    );
  }
}
