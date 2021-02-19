import MockDate from "mockdate";
import { LocalDate } from "./LocalDate";

MockDate.set("2020-09-27T10:00:00");

const a = new LocalDate("2020-01-01");
const b = new LocalDate("2021-01-01");

describe("LocalDate", () => {
  it("min returns earlier date", () => {
    expect(LocalDate.min()).toEqual(undefined);
    expect(LocalDate.min(a)).toEqual(a);
    expect(LocalDate.min(a, b)).toEqual(a);
    expect(LocalDate.min(b, a)).toEqual(a);
  });

  it("max returns earlier date", () => {
    expect(LocalDate.max()).toEqual(undefined);
    expect(LocalDate.max(b)).toEqual(b);
    expect(LocalDate.max(b, a)).toEqual(b);
    expect(LocalDate.max(a, b)).toEqual(b);
  });

  describe(".format", () => {
    it("if receives no args, formats using value format", () => {
      expect(a.format()).toEqual("2020-01-01");
    });

    it("format type can be customized", () => {
      expect(a.format("DD MMM YYYY")).toEqual("01 Jan 2020");
      expect(a.format({ type: "DD MMM YYYY" })).toEqual("01 Jan 2020");
    });
  });

  describe(".parse", () => {
    it("works for most of the known formats", () => {
      const inputs = [
        "2020-02-05",
        "5 Feb",
        "Feb 5, 2020",
        "Feb 5",
        "5 Feb 2020",
        "02/05/2020",
        "02-05-2020",
        "2020/02/05",
        " ",
        "asd",
        "2020",
      ];

      expect(
        inputs.map((input) => LocalDate.parse(input)?.toString())
      ).toEqual([
        "2020-02-05",
        "2020-02-05",
        "2020-02-05",
        "2020-02-05",
        "2020-02-05",
        "2020-02-05",
        "2020-02-05",
        "2020-02-05",
        undefined,
        undefined,
        "2020-01-01",
      ]);
    });
  });
});
