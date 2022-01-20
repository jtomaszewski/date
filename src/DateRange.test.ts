import MockDate from "mockdate";
import { DateRange, EndDateMustBeOnOrAfterStartDateError } from "./DateRange";
import { LocalDate } from "./LocalDate";

MockDate.set("2020-09-27T10:00:00");
const startAndEndYesterday = new DateRange({
  start: LocalDate.yesterday(),
  end: LocalDate.yesterday(),
});
const startYesterdayEndToday = new DateRange({
  start: LocalDate.yesterday(),
  end: LocalDate.today(),
});
const startYesterdayEndTomorrow = new DateRange({
  start: LocalDate.yesterday(),
  end: LocalDate.tomorrow(),
});
const startAndEndToday = new DateRange({
  start: LocalDate.today(),
  end: LocalDate.today(),
});
const startTodayEndTomorrow = new DateRange({
  start: LocalDate.today(),
  end: LocalDate.tomorrow(),
});
const startAndEndTomorrow = new DateRange({
  start: LocalDate.tomorrow(),
  end: LocalDate.tomorrow(),
});
const startYesterday = new DateRange({ start: LocalDate.yesterday() });
const startToday = new DateRange({ start: LocalDate.today() });
const startTomorrow = new DateRange({ start: LocalDate.tomorrow() });
const endYesterday = new DateRange({ end: LocalDate.yesterday() });
const endToday = new DateRange({ end: LocalDate.today() });
const endTomorrow = new DateRange({ end: LocalDate.tomorrow() });
const nullStartAndEnd = new DateRange({});

describe("DateRange", () => {
  const a = new LocalDate("2000-01-01");
  const b = new LocalDate("2000-01-31");

  describe(".constructor", () => {
    it("if called with correct two args, returns date range", () => {
      expect(new DateRange({ start: a, end: b })).toMatchObject({
        start: a,
        end: b,
      });
    });

    it("when constructed from invalid args, throws error", () => {
      expect(() => new DateRange({ start: b, end: a })).toThrowError(
        EndDateMustBeOnOrAfterStartDateError
      );
    });
  });

  describe(".from", () => {
    it("if called with correct two args, returns date range", () => {
      expect(DateRange.from({ start: a, end: b })).toMatchObject({
        start: a,
        end: b,
      });
    });

    it("if called with invalid args, returns undefined", () => {
      expect(DateRange.from({ start: b, end: a })).toEqual(undefined);
    });
  });

  describe(".getCurrentness", () => {
    it.each`
      range                        | expected
      ${startAndEndYesterday}      | ${"past"}
      ${startYesterdayEndToday}    | ${"current"}
      ${startYesterdayEndTomorrow} | ${"current"}
      ${startAndEndToday}          | ${"current"}
      ${startTodayEndTomorrow}     | ${"current"}
      ${startAndEndTomorrow}       | ${"future"}
      ${startYesterday}            | ${"current"}
      ${startToday}                | ${"current"}
      ${startTomorrow}             | ${"future"}
      ${endYesterday}              | ${"past"}
      ${endToday}                  | ${"current"}
      ${endTomorrow}               | ${"current"}
      ${nullStartAndEnd}           | ${"current"}
    `("returns currentness", ({ range, expected }) => {
      expect(range.getCurrentness()).toEqual(expected);
    });
  });

  describe(".isBefore", () => {
    it.each`
      range                        | expected
      ${startAndEndYesterday}      | ${true}
      ${startYesterdayEndToday}    | ${false}
      ${startYesterdayEndTomorrow} | ${false}
      ${startAndEndToday}          | ${false}
      ${startTodayEndTomorrow}     | ${false}
      ${startAndEndTomorrow}       | ${false}
      ${startYesterday}            | ${false}
      ${startToday}                | ${false}
      ${startTomorrow}             | ${false}
      ${endYesterday}              | ${true}
      ${endToday}                  | ${false}
      ${endTomorrow}               | ${false}
      ${nullStartAndEnd}           | ${false}
    `("returns true if date range is in the past", ({ range, expected }) => {
      expect(range.isBefore()).toEqual(expected);
    });
  });

  describe(".isAfter", () => {
    it.each`
      range                        | expected
      ${startAndEndYesterday}      | ${false}
      ${startYesterdayEndToday}    | ${false}
      ${startYesterdayEndTomorrow} | ${false}
      ${startAndEndToday}          | ${false}
      ${startTodayEndTomorrow}     | ${false}
      ${startAndEndTomorrow}       | ${true}
      ${startYesterday}            | ${false}
      ${startToday}                | ${false}
      ${startTomorrow}             | ${true}
      ${endYesterday}              | ${false}
      ${endToday}                  | ${false}
      ${endTomorrow}               | ${false}
      ${nullStartAndEnd}           | ${false}
    `("returns true if date range is in the past", ({ range, expected }) => {
      expect(range.isAfter()).toEqual(expected);
    });
  });

  describe(".contains", () => {
    it.each`
      range                        | expected
      ${startAndEndYesterday}      | ${false}
      ${startYesterdayEndToday}    | ${true}
      ${startYesterdayEndTomorrow} | ${true}
      ${startAndEndToday}          | ${true}
      ${startTodayEndTomorrow}     | ${true}
      ${startAndEndTomorrow}       | ${false}
      ${startYesterday}            | ${true}
      ${startToday}                | ${true}
      ${startTomorrow}             | ${false}
      ${endYesterday}              | ${false}
      ${endToday}                  | ${true}
      ${endTomorrow}               | ${true}
      ${nullStartAndEnd}           | ${true}
    `(
      "returns true if date range is currently ongoing",
      ({ range, expected }) => {
        expect(range.contains(LocalDate.today())).toEqual(expected);
      }
    );
  });

  describe(".format", () => {
    it("if end date is specified, returns formatted date range", () => {
      expect(new DateRange({ start: a, end: b }).format()).toEqual(
        "2000-01-01 — 2000-01-31"
      );
    });

    it('if end date isn\'t specified, returns formatted "From: START_DATE"', () => {
      expect(new DateRange({ start: a }).format()).toEqual("From 2000-01-01");
    });

    it('if start date isn\'t specified, returns formatted "Until: END_DATE"', () => {
      expect(new DateRange({ end: a }).format()).toEqual("Until 2000-01-01");
    });

    it('if no date is specified, returns formatted "Forever"', () => {
      expect(new DateRange({}).format()).toEqual("Forever");
    });
  });

  describe("compare", () => {
    it("compares the dates in ascending order", () => {
      const r1 = new DateRange({ start: a, end: a });
      const r2 = new DateRange({ start: a, end: b });
      const r3 = new DateRange({ start: b, end: b });
      const r4 = new DateRange({ start: a });
      const r5 = new DateRange({ start: b });
      const r6 = new DateRange({ end: a });
      const r7 = new DateRange({ end: b });
      const r8 = new DateRange({});

      expect([r1, r2, r3, r4, r5, r6, r7, r8].sort(DateRange.compare)).toEqual([
        r8,
        r6,
        r7,
        r4,
        r1,
        r2,
        r5,
        r3,
      ]);

      expect([r8, r7, r6, r5, r4, r3, r2, r1].sort(DateRange.compare)).toEqual([
        r8,
        r6,
        r7,
        r4,
        r1,
        r2,
        r5,
        r3,
      ]);
    });
  });
});
