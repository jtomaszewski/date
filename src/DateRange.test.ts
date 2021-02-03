import MockDate from "mockdate";
import { DateRange } from "./DateRange";
import { LocalDate } from "./LocalDate";

MockDate.set("2020-09-27T10:00:00");

describe("DateRange", () => {
  it("getCurrentness returns currentness", () => {
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

  it("isBefore returns true if date range is in the past", () => {
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

  it("contains returns true if date range is currently ongoing", () => {
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

  it("isAfter returns true if date range is in the past", () => {
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
});
