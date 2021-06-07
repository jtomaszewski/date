import { LocalDate, LocalDateFormat } from "./LocalDate";

export type DateRangeCurrentness = "past" | "current" | "future";

export class EndDateMustBeOnOrAfterStartDateError extends Error {
  constructor() {
    super("End date must be the same or after the start date.");
  }
}

export class DateRange {
  readonly start: LocalDate;

  private readonly startDateProvided: boolean;

  constructor(start?: LocalDate, readonly end?: LocalDate) {
    this.startDateProvided = !!start;
    this.start = start ?? LocalDate.MIN_DATE;

    if (end?.isBefore(this.start)) {
      throw new EndDateMustBeOnOrAfterStartDateError();
    }
  }

  /**
   * Returns `undefined` if date range args are invalid (that is, when `end` is before `start`).
   */
  static from(start: LocalDate, end?: LocalDate): DateRange | undefined {
    if (end?.isBefore(start)) {
      return undefined;
    }
    return new DateRange(start, end);
  }

  static compare(a: DateRange, b: DateRange): number {
    if (a.start.value === b.start.value) {
      if (a.end && b.end) {
        return LocalDate.compare(a.end, b.end);
      }
      if (!a.end && b.end) {
        return -1;
      }
      if (a.end && !b.end) {
        return 1;
      }
      return 0;
    }

    return LocalDate.compare(a.start, b.start);
  }

  getCurrentness(asOf: LocalDate = LocalDate.today()): DateRangeCurrentness {
    if (this.start.isAfter(asOf)) {
      return "future";
    }

    if (this.end?.isBefore(asOf)) {
      return "past";
    }

    return "current";
  }

  isBefore(date: LocalDate = LocalDate.today()): boolean {
    return this.getCurrentness(date) === "past";
  }

  contains(date: LocalDate): boolean {
    return this.getCurrentness(date) === "current";
  }

  isAfter(date: LocalDate = LocalDate.today()): boolean {
    return this.getCurrentness(date) === "future";
  }

  format({ dateFormat }: { dateFormat?: LocalDateFormat } = {}): string {
    if (this.end) {
      if (this.startDateProvided) {
        return `${this.start.format(dateFormat)} – ${this.end.format(
          dateFormat
        )}`;
      }
      return `To ${this.end.format(dateFormat)}`;
    }

    return `From ${this.start.format(dateFormat)}`;
  }
}
