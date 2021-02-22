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
      const pairs = [
        ["5 Feb", "2020-02-05"],
        ["Feb 5, 2020", "2020-02-05"],
        ["Feb 5", "2020-02-05"],
        ["5 Feb 2020", "2020-02-05"],
        ["5/2", "2020-02-05"],
        ["5/2/", "2020-02-05"],
        ["5/2/2", "2002-02-05"],
        ["5/2/22", "2022-02-05"],
        ["5/2/222", "2222-02-05"],
        ["5/2/2222", "2222-02-05"],
        ["05/02", "2020-02-05"],
        ["05/02/", "2020-02-05"],
        ["05/02/2", "2002-02-05"],
        ["05/02/20", "2020-02-05"],
        ["05/02/202", "2202-02-05"],
        ["05/02/2020", "2020-02-05"],
        ["05/02/2020", "2020-02-05"],
        ["2020/02/05", "2020-02-05"],
        ["5-2", "2020-02-05"],
        ["5-2-", "2020-02-05"],
        ["5-2-2", "2002-02-05"],
        ["5-2-22", "2022-02-05"],
        ["5-2-222", "2222-02-05"],
        ["5-2-2222", "2222-02-05"],
        ["05-02", "2020-02-05"],
        ["05-02-", "2020-02-05"],
        ["05-02-2", "2002-02-05"],
        ["05-02-20", "2020-02-05"],
        ["05-02-202", "2202-02-05"],
        ["05-02-2020", "2020-02-05"],
        ["05-02-2020", "2020-02-05"],
        ["2020-02-05", "2020-02-05"],
        [" ", undefined],
        ["asd", undefined],
        ["2020", "2020-01-01"],
        ["5", "2020-09-05"],
        ["5/", "2020-09-05"],
        ["5-", "2020-09-05"],
        ["11", "2020-09-11"],
        ["25", "2020-09-25"],
      ];

      pairs.forEach((pair) => {
        expect([pair[0], LocalDate.parse(pair[0])?.toString()]).toEqual(pair);
      });
    });
  });
});
