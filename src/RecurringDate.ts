import moment from "moment-timezone";
import { getNextRecurringDate } from "./getNextRecurringDate";
import { LocalDate } from "./LocalDate";

export interface DailyRecurringDateInterface {
  frequency: "daily";
}

export interface WeeklyRecurringDateInterface {
  frequency: "weekly";
  /**
   * In range 1-7 (1 = Monday, 7 = Sunday).
   */
  anniversaryDay: number;
}

export interface FortnightlyRecurringDateInterface {
  frequency: "fortnightly";
  startDate: LocalDate | string;
}

export interface MonthlyRecurringDateInterface {
  frequency: "monthly";
  /**
   * In range 1-28.
   */
  anniversaryDay: number;
}

export interface AnnuallyRecurringDateInterface {
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

export type RecurringDateInterface =
  | DailyRecurringDateInterface
  | WeeklyRecurringDateInterface
  | FortnightlyRecurringDateInterface
  | MonthlyRecurringDateInterface
  | AnnuallyRecurringDateInterface;

export type RecurringDateFrequency = RecurringDateInterface["frequency"];

export class RecurringDate {
  private data: Readonly<RecurringDateInterface>;

  constructor(data: Readonly<RecurringDateInterface>) {
    this.data = data;
  }

  get frequency(): RecurringDateFrequency {
    return this.data.frequency;
  }

  getNextRecurrence(today: LocalDate = LocalDate.now()): LocalDate {
    return getNextRecurringDate({
      asOf: today,
      frequency: this.frequency,
      startDate:
        this.data.frequency === "fortnightly"
          ? LocalDate.from(this.data.startDate)
          : undefined,
      anniversaryDay:
        "anniversaryDay" in this.data ? this.data.anniversaryDay : undefined,
      anniversaryMonth:
        "anniversaryMonth" in this.data
          ? this.data.anniversaryMonth
          : undefined,
    });
  }

  format({ type = "X of Y" }: { type: "X of Y" | "/FF" }): string {
    if (type === "X of Y") {
      if (this.data.frequency === "weekly") {
        return `${moment()
          .isoWeekday(this.data.anniversaryDay)
          .format("dddd")} each week`;
      }

      if (this.data.frequency === "monthly") {
        return `${moment()
          .date(this.data.anniversaryDay)
          .format("Do")} of each month`;
      }

      if (this.data.frequency === "annually" && this.data.anniversaryMonth) {
        return `${moment()
          .date(this.data.anniversaryDay)
          .month(this.data.anniversaryMonth - 1)
          .format("Do MMMM")} each year`;
      }
    }

    if (type === "/FF") {
      // eslint-disable-next-line default-case
      switch (this.frequency) {
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
      }
    }

    throw new TypeError("Not implemented");
  }
}
