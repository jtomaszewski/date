import moment from "moment-timezone";
import { DefaultTimeZoneRef } from "./DefaultTimeZoneRef";
import { LocalDate, LocalDateFormat } from "./LocalDate";

interface FormatOptions {
  type: LocalDateFormat | "DD MMM YYYY h:mm A";
}

type FriendlyFormatType = "date" | "datetime";

const calendarDateFormat = {
  sameDay: "[today]",
  nextDay: "[tomorrow]",
  nextWeek: "dddd",
  lastDay: "[yesterday]",
  lastWeek: "ddd, DD MMM",
  sameElse: "ddd, DD MMM",
};

const calendarDateTimeFormat = {
  sameDay: "[Today,] h:mma",
  nextDay: "DD MMM h:mma",
  nextWeek: "DD MMM h:mma",
  lastDay: "[Yesterday,] h:mma",
  lastWeek: "DD MMM h:mma",
  sameElse: "DD MMM h:mma",
};

export class DateTimeWithTimeZone {
  readonly moment: moment.Moment;

  constructor(
    m: moment.Moment,
    readonly timeZone: string = DefaultTimeZoneRef.current
  ) {
    this.moment = m.tz() === timeZone ? m : m.clone().tz(timeZone);
  }

  static from(
    value: string | Date | moment.Moment | DateTimeWithTimeZone | LocalDate,
    timeZone: string = DefaultTimeZoneRef.current
  ): DateTimeWithTimeZone {
    if (value instanceof DateTimeWithTimeZone) {
      return value;
    }

    if (value instanceof LocalDate) {
      return DateTimeWithTimeZone.fromLocalDate(value, timeZone);
    }

    if (value instanceof Date) {
      return DateTimeWithTimeZone.fromDate(value, timeZone);
    }

    if (typeof value === "string") {
      if (value.length === 10) {
        return DateTimeWithTimeZone.fromLocalDate(value, timeZone);
      }
      return DateTimeWithTimeZone.fromString(value, timeZone);
    }

    return DateTimeWithTimeZone.fromMoment(value, timeZone);
  }

  static fromMoment(
    m: moment.Moment,
    timeZone: string = DefaultTimeZoneRef.current
  ): DateTimeWithTimeZone {
    return new DateTimeWithTimeZone(m, timeZone);
  }

  static fromDate(
    date: Date,
    timeZone: string = DefaultTimeZoneRef.current
  ): DateTimeWithTimeZone {
    return new DateTimeWithTimeZone(moment.tz(date, timeZone), timeZone);
  }

  static fromLocalDate(
    date: LocalDate | string,
    timeZone: string = DefaultTimeZoneRef.current
  ): DateTimeWithTimeZone {
    return new DateTimeWithTimeZone(
      moment.tz(
        typeof date === "string" ? date : date.toString(),
        "YYYY-MM-DD",
        timeZone
      ),
      timeZone
    );
  }

  static fromTimestampString(
    timestamp: string,
    timeZone: string = DefaultTimeZoneRef.current
  ): DateTimeWithTimeZone {
    return new DateTimeWithTimeZone(
      moment.tz(timestamp, "x", timeZone),
      timeZone
    );
  }

  static fromString(
    string: string,
    timeZone: string = DefaultTimeZoneRef.current
  ): DateTimeWithTimeZone {
    return new DateTimeWithTimeZone(moment.tz(string, timeZone), timeZone);
  }

  add(amount: number, unit: moment.unitOfTime.Base): DateTimeWithTimeZone {
    return new DateTimeWithTimeZone(
      this.moment.clone().add(amount, unit),
      this.timeZone
    );
  }

  subtract(amount: number, unit: moment.unitOfTime.Base): DateTimeWithTimeZone {
    return new DateTimeWithTimeZone(
      this.moment.clone().subtract(amount, unit),
      this.timeZone
    );
  }

  private now(): moment.Moment {
    return moment().tz(this.timeZone);
  }

  // TODO fix it in the backend instead, so such an edge case doesn't have to be handled here
  // ( https://ailohq.slack.com/archives/C02UG6U61/p1596099637031600 )
  static fromDateSubtractingAMillisecond(
    timestamp: string,
    timeZone: string = DefaultTimeZoneRef.current
  ): DateTimeWithTimeZone {
    const m = moment.tz(timestamp, timeZone).subtract(1, "millisecond");
    return new DateTimeWithTimeZone(m, timeZone);
  }

  static now(
    timeZone: string = DefaultTimeZoneRef.current
  ): DateTimeWithTimeZone {
    return new DateTimeWithTimeZone(moment.tz(timeZone), timeZone);
  }

  format(arg?: FormatOptions | FormatOptions["type"]): string {
    const options = typeof arg === "string" ? { type: arg } : arg;
    const { type } = options ?? {};
    return this.moment.format(type);
  }

  friendlyFormat(format: FriendlyFormatType = "date"): string {
    return this.moment.calendar(
      this.now(),
      format === "date" ? calendarDateFormat : calendarDateTimeFormat
    );
  }

  isToday(): boolean {
    return this.moment.isSame(moment.tz(this.timeZone), "day");
  }

  isOverdue(): boolean {
    return this.moment.isBefore(moment.tz(this.timeZone), "day");
  }

  isBefore(
    date: DateTimeWithTimeZone,
    granularity?: moment.unitOfTime.StartOf
  ): boolean {
    return this.moment.isBefore(date.moment, granularity);
  }

  isAfter(
    date: DateTimeWithTimeZone,
    granularity?: moment.unitOfTime.StartOf
  ): boolean {
    return this.moment.isAfter(date.moment, granularity);
  }

  isSame(
    date: DateTimeWithTimeZone,
    granularity?: moment.unitOfTime.StartOf
  ): boolean {
    return this.moment.isSame(date.moment, granularity);
  }

  isSameOrAfter(
    date: DateTimeWithTimeZone,
    granularity?: moment.unitOfTime.StartOf
  ): boolean {
    return this.moment.isSameOrAfter(date.moment, granularity);
  }

  isSameOrBefore(
    date: DateTimeWithTimeZone,
    granularity?: moment.unitOfTime.StartOf
  ): boolean {
    return this.moment.isSameOrBefore(date.moment, granularity);
  }

  daysBeforeToday(): number {
    return this.now().startOf("day").diff(this.moment.startOf("day"), "days");
  }

  daysAfterToday(): number {
    return this.moment.startOf("day").diff(this.now().startOf("day"), "days");
  }

  toISOString(): string {
    return this.moment.toISOString(true);
  }

  toDate(): Date {
    return this.moment.toDate();
  }

  toLocalDate(): LocalDate {
    return LocalDate.fromMoment(this.moment);
  }

  toLocalDateString(): string {
    return this.format("YYYY-MM-DD");
  }

  static isMaxDate(timestamp: string): boolean {
    return !!timestamp && timestamp.startsWith("+999999999");
  }

  /**
   * Returns the next time it will be the nth day of the month.
   * If today is the nth of the month, it returns today.
   * Throws an error if n > 28 because not every month has a 29th.
   */
  nextNthMonthDay(n: number): DateTimeWithTimeZone {
    if (n > 28) throw new Error("n must be less than or equal to 28");
    return new DateTimeWithTimeZone(
      this.moment.date() <= n
        ? this.moment.date(n)
        : this.moment.add(1, "month").date(n),
      this.timeZone
    );
  }
}
