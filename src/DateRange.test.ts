import MockDate from "mockdate";
import { DateRange, EndDateMustBeOnOrAfterStartDateError } from "./DateRange";
import { LocalDate } from "./LocalDate";

MockDate.set("2020-09-27T10:00:00");

describe("DateRange", () => {
  const a = new LocalDate("2000-01-01");
  const b = new LocalDate("2000-01-31");

  const days: { [key: string]: LocalDate | undefined } = {
    yesterday: LocalDate.yesterday(),
    today: LocalDate.today(),
    tomorrow: LocalDate.tomorrow(),
    infinity: undefined,
  };

  describe("constructor", () => {
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

  describe("from", () => {
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

  describe("getCurrentness", () => {
    describe.each`
      start          | end            | expected
      ${"yesterday"} | ${"yesterday"} | ${"past"}
      ${"yesterday"} | ${"today"}     | ${"current"}
      ${"yesterday"} | ${"tomorrow"}  | ${"current"}
      ${"today"}     | ${"today"}     | ${"current"}
      ${"today"}     | ${"tomorrow"}  | ${"current"}
      ${"tomorrow"}  | ${"tomorrow"}  | ${"future"}
      ${"infinity"}  | ${"yesterday"} | ${"past"}
      ${"infinity"}  | ${"today"}     | ${"current"}
      ${"infinity"}  | ${"tomorrow"}  | ${"current"}
      ${"yesterday"} | ${"infinity"}  | ${"current"}
      ${"today"}     | ${"infinity"}  | ${"current"}
      ${"tomorrow"}  | ${"infinity"}  | ${"future"}
    `("from $start to $end", ({ start, end, expected }) => {
      it("returns currentness", () => {
        expect(new DateRange(days[start], days[end]).getCurrentness()).toEqual(
          expected
        );
      });
    });
  });

  describe("isBefore", () => {
    describe.each`
      start          | end            | expected
      ${"yesterday"} | ${"yesterday"} | ${true}
      ${"yesterday"} | ${"today"}     | ${false}
      ${"yesterday"} | ${"tomorrow"}  | ${false}
      ${"today"}     | ${"today"}     | ${false}
      ${"today"}     | ${"tomorrow"}  | ${false}
      ${"tomorrow"}  | ${"tomorrow"}  | ${false}
      ${"infinity"}  | ${"yesterday"} | ${true}
      ${"infinity"}  | ${"today"}     | ${false}
      ${"infinity"}  | ${"tomorrow"}  | ${false}
      ${"yesterday"} | ${"infinity"}  | ${false}
      ${"today"}     | ${"infinity"}  | ${false}
      ${"tomorrow"}  | ${"infinity"}  | ${false}
    `("from $start to $end", ({ start, end, expected }) => {
      it("returns true if date range is in the past", () => {
        expect(new DateRange(days[start], days[end]).isBefore()).toEqual(
          expected
        );
      });
    });
  });

  describe("contains", () => {
    describe.each`
      start          | end            | expected
      ${"yesterday"} | ${"yesterday"} | ${false}
      ${"yesterday"} | ${"today"}     | ${true}
      ${"yesterday"} | ${"tomorrow"}  | ${true}
      ${"today"}     | ${"today"}     | ${true}
      ${"today"}     | ${"tomorrow"}  | ${true}
      ${"tomorrow"}  | ${"tomorrow"}  | ${false}
      ${"infinity"}  | ${"yesterday"} | ${false}
      ${"infinity"}  | ${"tomorrow"}  | ${true}
      ${"yesterday"} | ${"infinity"}  | ${true}
      ${"today"}     | ${"infinity"}  | ${true}
      ${"tomorrow"}  | ${"infinity"}  | ${false}
    `("from $start to $end", ({ start, end, expected }) => {
      it("returns true if date range is currently ongoing", () => {
        expect(
          new DateRange(days[start], days[end]).contains(LocalDate.today())
        ).toEqual(expected);
      });
    });
  });

  describe("isAfter", () => {
    describe.each`
      start          | end            | expected
      ${"yesterday"} | ${"yesterday"} | ${false}
      ${"yesterday"} | ${"today"}     | ${false}
      ${"yesterday"} | ${"tomorrow"}  | ${false}
      ${"today"}     | ${"today"}     | ${false}
      ${"today"}     | ${"tomorrow"}  | ${false}
      ${"tomorrow"}  | ${"tomorrow"}  | ${true}
      ${"infinity"}  | ${"yesterday"} | ${false}
      ${"infinity"}  | ${"tomorrow"}  | ${false}
      ${"yesterday"} | ${"infinity"}  | ${false}
      ${"today"}     | ${"infinity"}  | ${false}
      ${"tomorrow"}  | ${"infinity"}  | ${true}
    `("from $start to $end", ({ start, end, expected }) => {
      it("returns true if date range is in the past", () => {
        expect(new DateRange(days[start], days[end]).isAfter()).toEqual(
          expected
        );
      });
    });
  });

  describe("format", () => {
    it("if end date is specified, returns formatted date range", () => {
      expect(new DateRange(a, b).format()).toEqual("2000-01-01 – 2000-01-31");
    });

    it('if end date isn\'t specified, returns formatted "From: START_DATE"', () => {
      expect(new DateRange(a).format()).toEqual("From 2000-01-01");
    });

    it('if start date isn\'t specified, returns formatted "To: START_DATE"', () => {
      expect(new DateRange(undefined, a).format()).toEqual("To 2000-01-01");
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
