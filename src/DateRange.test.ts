import MockDate from "mockdate";
import { DateRange, EndDateMustBeOnOrAfterStartDateError } from "./DateRange";
import { LocalDate } from "./LocalDate";

MockDate.set("2020-09-27T10:00:00");

describe("DateRange", () => {
  const a = new LocalDate("2000-01-01");
  const b = new LocalDate("2000-01-31");

  const fromYesterdayToYesterday = new DateRange(
    LocalDate.yesterday(),
    LocalDate.yesterday()
  );
  const fromYesterdayToToday = new DateRange(
    LocalDate.yesterday(),
    LocalDate.today()
  );
  const fromYesterdayToTomorrow = new DateRange(
    LocalDate.yesterday(),
    LocalDate.tomorrow()
  );
  const fromTodayToToday = new DateRange(LocalDate.today(), LocalDate.today());
  const fromTodayToTomorrow = new DateRange(
    LocalDate.today(),
    LocalDate.tomorrow()
  );
  const fromTomorrowToTomorrow = new DateRange(
    LocalDate.tomorrow(),
    LocalDate.tomorrow()
  );

  describe(".constructor", () => {
    it("if called with correct two args, returns date range", () => {
      expect(new DateRange(a, b)).toMatchObject({
        start: a,
        end: b,
      });
    });

    it("when constructed from invalid args, throws error", () => {
      expect(() => new DateRange(b, a)).toThrowError(
        EndDateMustBeOnOrAfterStartDateError
      );
    });
  });

  describe(".from", () => {
    it("if called with correct two args, returns date range", () => {
      expect(DateRange.from(a, b)).toMatchObject({
        start: a,
        end: b,
      });
    });

    it("if called with invalid args, returns undefined", () => {
      expect(DateRange.from(b, a)).toEqual(undefined);
    });
  });

  it(".getCurrentness returns currentness relative to today", () => {
    expect(fromYesterdayToYesterday.getCurrentness()).toEqual("past");
    expect(fromYesterdayToToday.getCurrentness()).toEqual("current");
    expect(fromYesterdayToTomorrow.getCurrentness()).toEqual("current");
    expect(fromTodayToToday.getCurrentness()).toEqual("current");
    expect(fromTodayToTomorrow.getCurrentness()).toEqual("current");
    expect(fromTomorrowToTomorrow.getCurrentness()).toEqual("future");
  });

  it(".isBefore returns true if date range is in the past", () => {
    expect(fromYesterdayToYesterday.isBefore()).toEqual(true);
    expect(fromYesterdayToToday.isBefore()).toEqual(false);
    expect(fromYesterdayToTomorrow.isBefore()).toEqual(false);
    expect(fromTodayToToday.isBefore()).toEqual(false);
    expect(fromTodayToTomorrow.isBefore()).toEqual(false);
    expect(fromTomorrowToTomorrow.isBefore()).toEqual(false);
  });

  it(".contains returns true if date range is currently ongoing", () => {
    expect(fromYesterdayToYesterday.contains(LocalDate.today())).toEqual(false);
    expect(fromYesterdayToToday.contains(LocalDate.today())).toEqual(true);
    expect(fromYesterdayToTomorrow.contains(LocalDate.today())).toEqual(true);
    expect(fromTodayToToday.contains(LocalDate.today())).toEqual(true);
    expect(fromTodayToTomorrow.contains(LocalDate.today())).toEqual(true);
    expect(fromTomorrowToTomorrow.contains(LocalDate.today())).toEqual(false);
  });

  it(".isAfter returns true if date range is in the past", () => {
    expect(fromYesterdayToYesterday.isAfter()).toEqual(false);
    expect(fromYesterdayToToday.isAfter()).toEqual(false);
    expect(fromYesterdayToTomorrow.isAfter()).toEqual(false);
    expect(fromTodayToToday.isAfter()).toEqual(false);
    expect(fromTodayToTomorrow.isAfter()).toEqual(false);
    expect(fromTomorrowToTomorrow.isAfter()).toEqual(true);
  });

  describe(".format", () => {
    it("if end date is specified, returns formatted date range", () => {
      expect(new DateRange(a, b).format()).toEqual("2000-01-01 – 2000-01-31");
    });

    it('if end date isn\'t specified, returns formatted "From: START_DATE"', () => {
      expect(new DateRange(a).format()).toEqual("From 2000-01-01");
    });
  });

  describe("compare", () => {
    it("compares the dates in ascending order", () => {
      const r1 = new DateRange(a, a);
      const r2 = new DateRange(a, b);
      const r3 = new DateRange(b, b);
      const r4 = new DateRange(a);
      const r5 = new DateRange(b);
      expect([r1, r2, r3, r4, r5].sort(DateRange.compare)).toEqual([
        r4,
        r1,
        r2,
        r5,
        r3,
      ]);
      expect([r5, r4, r3, r2, r1].sort(DateRange.compare)).toEqual([
        r4,
        r1,
        r2,
        r5,
        r3,
      ]);
    });
  });
});
