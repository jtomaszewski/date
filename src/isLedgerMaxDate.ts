/**
 * Some of our legacy APIs when they mean "there's no max date",
 * they return string starting with "+999999999"
 * (instead of a `null` or `undefined` as it should be preferred).
 *
 * This function checks if the given string is of such a format.
 */
export function isLedgerMaxDate(timestamp: string): boolean {
  return !!timestamp && timestamp.startsWith("+999999999");
}
