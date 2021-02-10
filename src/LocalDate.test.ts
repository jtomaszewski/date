import { LocalDate } from "./LocalDate";

describe("LocalDate", () => {
  it("min returns earlier date", () => {
    const a = new LocalDate("2020-01-01");
    const b = new LocalDate("2021-01-01");
    expect(LocalDate.min()).toEqual(undefined);
    expect(LocalDate.min(a)).toEqual(a);
    expect(LocalDate.min(a, b)).toEqual(a);
    expect(LocalDate.min(b, a)).toEqual(a);
  });

  it("max returns earlier date", () => {
    const a = new LocalDate("2021-01-01");
    const b = new LocalDate("2020-01-01");
    expect(LocalDate.max()).toEqual(undefined);
    expect(LocalDate.max(a)).toEqual(a);
    expect(LocalDate.max(a, b)).toEqual(a);
    expect(LocalDate.max(b, a)).toEqual(a);
  });
});
