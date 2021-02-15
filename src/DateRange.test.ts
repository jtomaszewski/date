import MockDate from "mockdate";
import { DateRange, EndDateMustBeOnOrAfterStartDateError } from "./DateRange";
import { LocalDate } from "./LocalDate";

MockDate.set("2020-09-27T10:00:00");

describe("DateRange", () => {
  const a = new LocalDate("2000-01-01");
  const b = new LocalDate("2000-01-31");

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

  it(".getCurrentness returns currentness", () => {
    expect(
      new DateRange(
        LocalDate.yesterday(),
        LocalDate.yesterday()
      ).getCurrentness()
    ).toEqual("past");
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.today()).getCurrentness()
    ).toEqual("current");
    expect(
      new DateRange(
        LocalDate.yesterday(),
        LocalDate.tomorrow()
      ).getCurrentness()
    ).toEqual("current");
    expect(
      new DateRange(LocalDate.today(), LocalDate.today()).getCurrentness()
    ).toEqual("current");
    expect(
      new DateRange(LocalDate.today(), LocalDate.tomorrow()).getCurrentness()
    ).toEqual("current");
    expect(
      new DateRange(LocalDate.tomorrow(), LocalDate.tomorrow()).getCurrentness()
    ).toEqual("future");
  });

  it(".isBefore returns true if date range is in the past", () => {
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.yesterday()).isBefore()
    ).toEqual(true);
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.today()).isBefore()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.tomorrow()).isBefore()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.today(), LocalDate.today()).isBefore()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.today(), LocalDate.tomorrow()).isBefore()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.tomorrow(), LocalDate.tomorrow()).isBefore()
    ).toEqual(false);
  });

  it(".contains returns true if date range is currently ongoing", () => {
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.yesterday()).contains()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.today()).contains()
    ).toEqual(true);
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.tomorrow()).contains()
    ).toEqual(true);
    expect(
      new DateRange(LocalDate.today(), LocalDate.today()).contains()
    ).toEqual(true);
    expect(
      new DateRange(LocalDate.today(), LocalDate.tomorrow()).contains()
    ).toEqual(true);
    expect(
      new DateRange(LocalDate.tomorrow(), LocalDate.tomorrow()).contains()
    ).toEqual(false);
  });

  it(".isAfter returns true if date range is in the past", () => {
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.yesterday()).isAfter()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.today()).isAfter()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.yesterday(), LocalDate.tomorrow()).isAfter()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.today(), LocalDate.today()).isAfter()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.today(), LocalDate.tomorrow()).isAfter()
    ).toEqual(false);
    expect(
      new DateRange(LocalDate.tomorrow(), LocalDate.tomorrow()).isAfter()
    ).toEqual(true);
  });

  describe(".format", () => {
    it("if end date is specified, returns formatted date range", () => {
      expect(new DateRange(a, b).format()).toEqual("2000-01-01 - 2000-01-31");
    });

    it('if end date isn\'t specified, returns formatted "From: START_DATE"', () => {
      expect(new DateRange(a).format()).toEqual("From 2000-01-01");
    });
  });
});
