import { LocalDate } from "./LocalDate";

export type DateRangeCurrentness = "past" | "current" | "future";

export class DateRange {
  constructor(readonly start: LocalDate, readonly end?: LocalDate) {
    if (end?.isBefore(start)) {
      throw new TypeError(`End date must be the same or after the start date.`);
    }
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
