import moment from "moment-timezone";

export function convertNumberToTwoDigits(number: number): string {
  return number < 10 ? `0${number}` : `${number}`;
}

/**
 * Might be useful when working with some legacy UI components that rely on `Date`.
 *
 * @deprecated Use `LocalDate.from(dateString).toDate()` instead.
 */
export function convertDateStringToLocalDate(dateString: string): Date {
  const m = moment(dateString, "YYYY-MM-DD");
  const date = new Date();
  date.setFullYear(m.year());
  date.setMonth(m.month());
  date.setDate(m.date());
  return date;
}

/**
 * Might be useful when working with some legacy UI components that rely on `Date`.
 *
 * @deprecated Use `LocalDate.from(date).toString()` instead.
 */
export function convertLocalDatetoLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${convertNumberToTwoDigits(
    date.getMonth() + 1
  )}-${convertNumberToTwoDigits(date.getDate())}`;
}
