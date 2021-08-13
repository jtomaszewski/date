import moment from "moment-timezone";
import { DateRange } from "./DateRange";
import { LocalDate } from "./LocalDate";
import {
  RecurringDateFrequency,
  RecurringDateInput,
  getValidAnchorDate,
} from "./RecurringDateInput";

export function formatRecurringDateFrequency(
  frequency: RecurringDateFrequency,
  opts: {
    /**
     * @default "/FF"
     */
    type?: "/FF" | "/FFFF";
  } = {}
): string {
  const type = opts.type ?? "/FF";

  if (type === "/FF") {
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

  if (type === "/FFFF") {
    switch (frequency) {
      case "daily":
        return "/day";
      case "weekly":
        return "/week";
      case "fortnightly":
        return "/fortnight";
      case "monthly":
        return "/month";
      case "annually":
        return "/year";
      default:
        throw new TypeError(`Unknown frequency: ${frequency}`);
    }
  }

  throw new TypeError(`Unknown type: ${type}`);
}

const frequencyPeriodLength = {
  daily: { number: 1, unit: "day" },
  weekly: { number: 1, unit: "week" },
  fortnightly: { number: 2, unit: "week" },
  monthly: { number: 1, unit: "month" },
  annually: { number: 1, unit: "year" },
} as const;

export class RecurringDate {
  readonly frequency: RecurringDateFrequency;

  private anchorDate: LocalDate;

  constructor(input: Readonly<RecurringDateInput>) {
    this.anchorDate = getValidAnchorDate(input);
    this.frequency = input.frequency;
  }

  private get period() {
    return frequencyPeriodLength[this.frequency];
  }

  getNextOccurrence(
    asOf: LocalDate = LocalDate.today(),
    options: {
      /**
       * If true, will return provided `asOf` date if an occurrence falls on that day.
       * @default false
       */
      inclusive?: boolean;
    } = {}
  ): LocalDate {
    const { inclusive = false } = options;

    if (inclusive && this.hasOccurrenceOn(asOf)) {
      return LocalDate.from(asOf);
    }

    const periodsToAdd = Math.floor(this.periodsToStartDate(asOf) + 1);
    return this.anchorDate.add(
      periodsToAdd * this.period.number,
      this.period.unit
    );
  }

  getPreviousOccurrence(
    asOf: LocalDate = LocalDate.today(),

    options: {
      /**
       * If true, will return provided `asOf` date if an occurrence falls on that day.
       * @default false
       */
      inclusive?: boolean;
    } = {}
  ): LocalDate {
    const { inclusive = false } = options;

    if (inclusive && this.hasOccurrenceOn(asOf)) {
      return LocalDate.from(asOf);
    }

    const periodsToAdd = Math.ceil(this.periodsToStartDate(asOf) - 1);
    return this.anchorDate.add(
      periodsToAdd * this.period.number,
      this.period.unit
    );
  }

  hasOccurrenceOn(date: LocalDate = LocalDate.today()): boolean {
    const periodsBetween = Math.round(
      date.diff(this.anchorDate, this.period.unit) / this.period.number
    );
    return this.anchorDate
      .add(periodsBetween * this.period.number, this.period.unit)
      .toEqual(date);
  }

  private periodsToStartDate(date: LocalDate = LocalDate.today()): number {
    return (
      date.diff(this.anchorDate, this.period.unit, true) / this.period.number
    );
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

  format({
    type = "X of Y",
  }: { type?: "X of Y" | "/FF" | "/FFFF" } = {}): string {
    if (type === "X of Y") {
      // eslint-disable-next-line default-case
      switch (this.frequency) {
        case "daily":
          return "Every day";

        case "fortnightly":
          return `Fortnightly starting with ${LocalDate.from(
            this.anchorDate
          ).format("D MMM YYYY")}`;

        case "weekly":
          return `${moment()
            .isoWeekday(this.anchorDate.dayOfWeek)
            .format("dddd")} each week`;

        case "monthly":
          return `${moment()
            .date(this.anchorDate.dayOfMonth)
            .format("Do")} of each month`;

        case "annually":
          return `${moment()
            .date(this.anchorDate.dayOfMonth)
            .month(this.anchorDate.month)
            .format("Do MMMM")} each year`;
      }
    }

    if (type === "/FF" || type === "/FFFF") {
      return formatRecurringDateFrequency(this.frequency, { type });
    }

    throw new TypeError(
      ".format() not implemented for this recurring date input and format type"
    );
  }
}
