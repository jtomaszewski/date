import { LocalDate } from "./LocalDate";

export type DateRangeCurrentness = "past" | "current" | "future";

export class EndDateMustBeOnOrAfterStartDateError extends Error {
  constructor() {
    super("End date must be the same or after the start date.");
  }
}

export class DateRange {
  constructor(readonly start: LocalDate, readonly end?: LocalDate) {
    if (end?.isBefore(start)) {
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

  contains(date: LocalDate = LocalDate.today()): boolean {
    return this.getCurrentness(date) === "current";
  }

  isAfter(date: LocalDate = LocalDate.today()): boolean {
    return this.getCurrentness(date) === "future";
  }
}
