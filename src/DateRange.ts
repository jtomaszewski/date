import { LocalDate, LocalDateFormat } from "./LocalDate";

export type DateRangeCurrentness = "past" | "current" | "future";

export class EndDateMustBeOnOrAfterStartDateError extends Error {
  constructor() {
    super("End date must be the same or after the start date.");
  }
}

type DateRangeParams = {
  start?: LocalDate;
  end?: LocalDate;
};

export class DateRange {
  readonly start?: LocalDate;

  readonly end?: LocalDate;

  constructor(params: DateRangeParams) {
    if (endDateBeforeStartDate(params)) {
      throw new EndDateMustBeOnOrAfterStartDateError();
    }
    this.start = params?.start;
    this.end = params?.end;
  }

  /**
   * Returns `undefined` if date range args are invalid (that is, when `end` is before `start`).
   */
  static from(params: DateRangeParams): DateRange | undefined {
    if (endDateBeforeStartDate(params)) {
      return undefined;
    }
    return new DateRange(params);
  }

  static compare(a: DateRange, b: DateRange): number {
    if (a.start?.value === b.start?.value) {
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

    if (!a.start) {
      return -1;
    }

    if (!b.start) {
      return 1;
    }

    return LocalDate.compare(a.start, b.start);
  }

  getCurrentness(asOf: LocalDate = LocalDate.today()): DateRangeCurrentness {
    if (this.start?.isAfter(asOf)) {
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
    if (this.start && this.end) {
      return `${this.start.format(dateFormat)} — ${this.end.format(
        dateFormat
      )}`;
    }

    if (this.start) {
      return `From ${this.start.format(dateFormat)}`;
    }

    if (this.end) {
      return `Until ${this.end.format(dateFormat)}`;
    }

    return `Forever`;
  }
}

function endDateBeforeStartDate(params: DateRangeParams): boolean {
  if (!params.start || !params.end) {
    return false;
  }
  return params.end.isBefore(params.start);
}
