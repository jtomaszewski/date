/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import moment from "moment-timezone";
import { DateTimeWithTimeZone } from "./DateTimeWithTimeZone";
import { DefaultTimeZoneRef } from "./DefaultTimeZoneRef";

export type LocalDateUnit =
  | "year"
  | "years"
  | "y"
  | "month"
  | "months"
  | "M"
  | "week"
  | "weeks"
  | "w"
  | "day"
  | "days"
  | "d";

export type LocalDateFormat =
  | "D"
  | "MMM"
  | "D MMM"
  | "DD MMM"
  | "DD MMMM"
  | "DD MMM YY"
  | "D MMM YYYY"
  | "DD MMMM YYYY"
  | "DD MMM YYYY"
  | "YYYY-MM-DD"
  | "DD/MM/YYYY"
  | "Do [of] MMMM YYYY";

interface FormatOptions {
  type: LocalDateFormat;
}

export const localDateValueFormat = "YYYY-MM-DD" as const;

function convertNumberToTwoDigits(number: number): string {
  return number < 10 ? `0${number}` : `${number}`;
}

export class LocalDate {
  constructor(readonly value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.exec(value)) {
      throw new TypeError(`Invalid LocalDate constructor value: ${value}`);
    }
  }

  private _moment?: moment.Moment;

  private get moment(): moment.Moment {
    if (!this._moment) {
      this._moment = moment.tz(
        this.value,
        localDateValueFormat,
        DefaultTimeZoneRef.current
      );
    }
    return this._moment;
  }

  static from(
    value: string | Date | moment.Moment | LocalDate | DateTimeWithTimeZone
  ): LocalDate {
    if (value instanceof LocalDate) {
      return value;
    }

    if (value instanceof DateTimeWithTimeZone) {
      return this.fromMoment(value.moment);
    }

    if (value instanceof Date) {
      return LocalDate.fromDate(value);
    }

    if (typeof value === "string") {
      return LocalDate.fromString(value);
    }

    return LocalDate.fromMoment(value);
  }

  static fromMoment(m: moment.Moment): LocalDate {
    return new LocalDate(m.format(localDateValueFormat));
  }

  static fromDate(date: Date): LocalDate {
    const value = `${date.getFullYear()}-${convertNumberToTwoDigits(
      date.getMonth() + 1
    )}-${convertNumberToTwoDigits(date.getDate())}`;
    return new LocalDate(value);
  }

  static fromString(string: string): LocalDate {
    return new LocalDate(string.slice(0, localDateValueFormat.length));
  }

  /**
   * Will try to parse the string to a LocalDate.
   * If string is empty or of invalid format, will return undefined.
   */
  static parse(string: string | null | undefined): LocalDate | undefined {
    if (!string) {
      return undefined;
    }
    // eslint-disable-next-line no-param-reassign
    string = string.trim();

    // Prefer European/Australian format over American
    // (DD/MM instead of MM/DD)
    try {
      if (string.match(/^\d{1,2}\s*[./;_-]?$/)) {
        return this.fromMoment(moment(string, "DD"));
      }
      if (string.match(/^\d{1,2}\s*[./;_-]\s*\d{1,2}\s*[./;_-]?$/)) {
        return this.fromMoment(moment(string, "DD.MM"));
      }
      if (string.match(/^(?:\d{1,2}\s*[./;_-]\s*){2}\d$/)) {
        return this.fromMoment(
          moment(`${string.slice(0, -1)}200${string.slice(-1)}`, "DD/MM/YYYY")
        );
      }
      if (string.match(/^(?:\d{1,2}\s*[./;_-]\s*){2}\d{3}$/)) {
        return this.fromMoment(
          moment(`${string.slice(0, -3)}2${string.slice(-3)}`, "DD/MM/YYYY")
        );
      }
      if (string.match(/^(?:\d{1,2}\s*[./;_-]\s*){2}\d{2,4}$/)) {
        return this.fromMoment(moment(string, "DD/MM/YYYY"));
      }
    } catch {
      return undefined;
    }

    try {
      const timestamp = Date.parse(string);
      const date = new Date(timestamp);
      // Chrome sets 2001 by default if no year is given
      // ( https://stackoverflow.com/questions/40504116/default-year-in-date-if-datestring-does-not-have-year-part )
      const defaultYear = 2001;
      if (
        !string.includes(String(defaultYear)) &&
        date.getFullYear() === defaultYear
      ) {
        date.setFullYear(new Date().getFullYear());
      }
      return this.fromDate(date);
    } catch {
      return undefined;
    }
  }

  static min(...args: []): undefined;
  static min(...args: [LocalDate, ...LocalDate[]]): LocalDate;
  static min(...args: LocalDate[]): LocalDate | undefined {
    if (args.length === 0) {
      return undefined;
    }
    let min = args[0];
    for (let i = 1; i < args.length; i++) {
      min = min.isBefore(args[i]) ? min : args[i];
    }
    return min;
  }

  static max(...args: []): undefined;
  static max(...args: [LocalDate, ...LocalDate[]]): LocalDate;
  static max(...args: LocalDate[]): LocalDate | undefined {
    if (args.length === 0) {
      return undefined;
    }
    let max = args[0];
    for (let i = 1; i < args.length; i++) {
      max = max.isAfter(args[i]) ? max : args[i];
    }
    return max;
  }

  static yesterday(timeZone: string = DefaultTimeZoneRef.current): LocalDate {
    return new LocalDate(
      moment.tz(timeZone).format(localDateValueFormat)
    ).subtract(1, "day");
  }

  static today(timeZone: string = DefaultTimeZoneRef.current): LocalDate {
    return new LocalDate(moment.tz(timeZone).format(localDateValueFormat));
  }

  static tomorrow(timeZone: string = DefaultTimeZoneRef.current): LocalDate {
    return new LocalDate(moment.tz(timeZone).format(localDateValueFormat)).add(
      1,
      "day"
    );
  }

  setMonth(month: number): LocalDate {
    return new LocalDate(
      this.moment.clone().month(month).format(localDateValueFormat)
    );
  }

  setDayOfMonth(date: number): LocalDate {
    return new LocalDate(
      this.moment.clone().date(date).format(localDateValueFormat)
    );
  }

  setDayOfWeek(isoWeekday: number): LocalDate {
    return new LocalDate(
      this.moment.clone().isoWeekday(isoWeekday).format(localDateValueFormat)
    );
  }

  add(amount: number, unit: LocalDateUnit): LocalDate {
    return new LocalDate(
      this.moment.clone().add(amount, unit).format(localDateValueFormat)
    );
  }

  subtract(amount: number, unit: LocalDateUnit): LocalDate {
    return new LocalDate(
      this.moment.clone().subtract(amount, unit).format(localDateValueFormat)
    );
  }

  isBefore(date: LocalDate): boolean {
    return this.moment.isBefore(date.moment, "day");
  }

  isAfter(date: LocalDate): boolean {
    return this.moment.isAfter(date.moment, "day");
  }

  isSame(date: LocalDate): boolean {
    return this.moment.isSame(date.moment, "day");
  }

  isSameOrAfter(date: LocalDate): boolean {
    return this.moment.isSameOrAfter(date.moment, "day");
  }

  isSameOrBefore(date: LocalDate): boolean {
    return this.moment.isSameOrBefore(date.moment, "day");
  }

  format(arg?: FormatOptions | FormatOptions["type"]): string {
    const options = typeof arg === "string" ? { type: arg } : arg;
    const { type = localDateValueFormat } = options ?? {};
    return this.moment.format(type);
  }

  toString(): string {
    return this.format(localDateValueFormat);
  }

  toDate(): Date {
    const date = new Date();
    date.setFullYear(this.moment.year());
    date.setMonth(this.moment.month());
    date.setDate(this.moment.date());
    return date;
  }
}
