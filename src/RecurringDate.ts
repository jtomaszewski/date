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
    const periodsBetween = this.periodsToStartDate(date);
    if (Number.isInteger(periodsBetween)) {
      return this.anchorDate
        .add(periodsBetween * this.period.number, this.period.unit)
        .toEqual(date);
    }
    return false;
  }

  private periodsToStartDate(date: LocalDate = LocalDate.today()): number {
    return (
      -this.anchorDate.diff(date, this.period.unit, true) / this.period.number
    );
  }

  /**
   * Gets next occurrence from `asOf`,
   * that is no later than on `end` (if `end` is given).
   *
   * If `dateRange` has no start date, returns the next occurrence from today (inclusive).
   */
  getNextOccurrenceInDateRange(
    dateRange: DateRange,
    asOf: LocalDate = LocalDate.today()
  ): LocalDate | undefined {
    const occurrence = this.getNextOccurrence(
      dateRange.start
        ? LocalDate.max(dateRange.start.subtract(1, "day"), asOf)
        : asOf
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
   *
   * If `dateRange` has no start date, will return descending list from the end date.
   *
   * If `dateRange` has no start or end date, provides ascending list from today.
   */
  getOccurrencesInDateRange(dateRange: DateRange, limit?: number): LocalDate[] {
    const result = [];
    let date: LocalDate;
    let searchDirection: "ascending" | "descending" = "ascending";

    if (dateRange.start) {
      date = dateRange.start.subtract(1, "day");
    } else if (dateRange.end) {
      date = dateRange.end.add(1, "day");
      searchDirection = "descending";
    } else {
      date = LocalDate.today();
    }

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
      if (
        searchDirection === "ascending" &&
        dateRange.end &&
        date.isSameOrAfter(dateRange.end)
      ) {
        break;
      }
      if (
        searchDirection === "descending" &&
        dateRange.start &&
        date.isSameOrBefore(dateRange.start)
      ) {
        break;
      }
      date =
        searchDirection === "ascending"
          ? this.getNextOccurrence(date)
          : this.getPreviousOccurrence(date);
      result.push(date);
    }
    return result;
  }

  format({
    type = "X of Y",
  }: {
    /**
     * - X of Y
     *   - Every day
     *   - Saturday each week
     *   - Fortnightly starting with 5 Jan 2021
     *   - 5th of each month
     *   - 5th January each year
     * - /FF
     *   - /day
     *   - /wk
     *   - /fn
     *   - /mo
     *   - /yr
     * - /FFFF
     *   - /day
     *   - /week
     *   - /fortnight
     *   - /month
     *   - /year
     * - "F-ly on D"
     *   - daily
     *   - weekly on Friday
     *   - every 2nd Friday
     *   - monthly on the 12th
     *   - annually on the 12th of August
     *  @default "X of Y"
     */
    type?: "X of Y" | "/FF" | "/FFFF" | "F-ly on D";
  } = {}): string {
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

    if (type === "F-ly on D") {
      // eslint-disable-next-line default-case
      switch (this.frequency) {
        case "daily":
          return "daily";

        case "weekly":
          return `weekly on ${moment()
            .isoWeekday(this.anchorDate.dayOfWeek)
            .format("dddd")}`;

        case "fortnightly":
          return `every 2nd ${moment()
            .isoWeekday(this.anchorDate.dayOfWeek)
            .format("dddd")}`;

        case "monthly":
          return `monthly on the ${moment()
            .date(this.anchorDate.dayOfMonth)
            .format("Do")}`;

        case "annually": {
          const date = moment()
            .date(this.anchorDate.dayOfMonth)
            .month(this.anchorDate.month);
          return `annually on the ${date.format("Do")} of ${date.format(
            "MMMM"
          )}`;
        }
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
