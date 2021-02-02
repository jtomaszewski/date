let defaultTimeZone = "Australia/Sydney";

export const DefaultTimeZoneRef = {
  get current(): string {
    return defaultTimeZone;
  },

  set current(timeZone: string) {
    defaultTimeZone = timeZone;
  },
};
