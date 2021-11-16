import MockDate from "mockdate";
import moment, { isMoment } from "moment-timezone";
import { LocalDate, LocalDateFormat } from "./LocalDate";

MockDate.set("2020-09-27T10:00:00");

const a = new LocalDate("2020-01-01");
const b = new LocalDate("2021-01-01");

// Checks that the passed array's type covers every format of LocalDateFormat (and returns the array)
const checkArrayContainsAllFormats = <T extends LocalDateFormat[]>(
  formats: T & ([LocalDateFormat] extends [T[number]] ? unknown : never)
): T => formats;

describe("LocalDate", () => {
  describe("from", () => {
    it("when constructed from a date string, returns its date", () => {
      expect(LocalDate.from("2021-01-01").toString()).toEqual("2021-01-01");
      expect(LocalDate.from("2021-01-15").toString()).toEqual("2021-01-15");
      expect(LocalDate.from("2021-02-01").toString()).toEqual("2021-02-01");
      expect(LocalDate.from("2021-02-15").toString()).toEqual("2021-02-15");
      expect(LocalDate.from("2021-02-28").toString()).toEqual("2021-02-28");
      expect(LocalDate.from("2020-02-29").toString()).toEqual("2020-02-29");
      expect(LocalDate.from("2021-03-01").toString()).toEqual("2021-03-01");
      expect(LocalDate.from("2021-03-15").toString()).toEqual("2021-03-15");
      expect(LocalDate.from("2021-03-31").toString()).toEqual("2021-03-31");
      expect(LocalDate.from("2021-04-01").toString()).toEqual("2021-04-01");
    });

    it("when constructed from an invalid date string, throws an error", () => {
      expect(() =>
        LocalDate.from("2021-02-30")
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid LocalDate constructor value: 2021-02-30"`
      );
    });

    it("when constructed from a timestamp string, returns its date", () => {
      expect(LocalDate.from("2021-03-02T20:00:00Z").toString()).toEqual(
        "2021-03-02"
      );
    });

    it("when constructed from a timestamp string and keepTimeZone is false, returns date in the default time zone", () => {
      expect(
        LocalDate.from("2021-03-02T20:00:00Z", {
          keepTimeZone: false,
        }).toString()
      ).toEqual("2021-03-03");
    });

    it("when constructed from a moment, returns its date", () => {
      expect(
        LocalDate.from(moment.utc("2021-03-02T20:00:00Z")).toString()
      ).toEqual("2021-03-02");
    });

    it("when constructed from a moment and keepTimeZone is false, returns date in the default time zone", () => {
      expect(
        LocalDate.from(moment.utc("2021-03-02T20:00:00Z"), {
          keepTimeZone: false,
        }).toString()
      ).toEqual("2021-03-03");
    });
  });

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

    const date = LocalDate.fromString("2021-10-03");
    const formatsAndExpectations = [
      ["D MMM YY", "3 Oct 21"],
      ["D MMM YYYY", "3 Oct 2021"],
      ["D MMM", "3 Oct"],
      ["D MMMM YYYY", "3 October 2021"],
      ["D MMMM", "3 October"],
      ["D", "3"],
      ["DD", "03"],
      ["DD MMM YY", "03 Oct 21"],
      ["DD MMM YYYY", "03 Oct 2021"],
      ["DD MMM", "03 Oct"],
      ["DD MMMM YYYY", "03 October 2021"],
      ["DD MMMM", "03 October"],
      ["DD/MM/YYYY", "03/10/2021"],
      ["MM", "10"],
      ["MMM", "Oct"],
      ["YYYY-MM-DD", "2021-10-03"],
      ["Do [of] MMMM YYYY", "3rd of October 2021"],
      ["MMMM D, YYYY", "October 3, 2021"],
      ["YY", "21"],
      ["YYYY", "2021"],
    ] as const;

    // There will be an error here if formatsAndExceptions does not contain an entry for every type in the union LocalDateFormat
    checkArrayContainsAllFormats(formatsAndExpectations.map((test) => test[0]));

    it.each(formatsAndExpectations)(
      "when passed the format '%s', should output '%s'",
      (format, expected) => {
        expect(date.format(format)).toEqual(expected);
      }
    );

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
        ["5 / 2", "2020-02-05"],
        ["5/2/", "2020-02-05"],
        ["5 / 2 / ", "2020-02-05"],
        ["5/2/2", "2002-02-05"],
        ["5/2/22", "2022-02-05"],
        ["5/2/222", "2222-02-05"],
        ["5/2/2222", "2222-02-05"],
        ["5 / 2 / 2222", "2222-02-05"],
        ["05/02", "2020-02-05"],
        ["05/02/", "2020-02-05"],
        ["05/02/2", "2002-02-05"],
        ["05 / 02 / 2", "2002-02-05"],
        ["05/02/20", "2020-02-05"],
        ["05/02/202", "2202-02-05"],
        ["05/02/2020", "2020-02-05"],
        ["05/02/2020", "2020-02-05"],
        ["05 / 02 / 2020", "2020-02-05"],
        ["2020/02/05", "2020-02-05"],
        ["5-2", "2020-02-05"],
        ["5 - 2", "2020-02-05"],
        ["5-2-", "2020-02-05"],
        ["5 - 2 - ", "2020-02-05"],
        ["5-2-2", "2002-02-05"],
        ["5-2-22", "2022-02-05"],
        ["5-2-222", "2222-02-05"],
        ["5-2-2222", "2222-02-05"],
        ["5 - 2 - 2222", "2222-02-05"],
        ["05-02", "2020-02-05"],
        ["05-02-", "2020-02-05"],
        ["05-02-2", "2002-02-05"],
        ["05 - 02 - 2", "2002-02-05"],
        ["05-02-20", "2020-02-05"],
        ["05-02-202", "2202-02-05"],
        ["05-02-2020", "2020-02-05"],
        ["05-02-2020", "2020-02-05"],
        ["05 - 02 - 2020", "2020-02-05"],
        ["2020-02-05", "2020-02-05"],
        ["5.2", "2020-02-05"],
        ["5 . 2", "2020-02-05"],
        ["5.2.", "2020-02-05"],
        ["5 . 2 . ", "2020-02-05"],
        ["5.2.2", "2002-02-05"],
        ["5.2.22", "2022-02-05"],
        ["5.2.222", "2222-02-05"],
        ["5.2.2222", "2222-02-05"],
        ["5 . 2 . 2222", "2222-02-05"],
        ["05.02", "2020-02-05"],
        ["05.02.", "2020-02-05"],
        ["05.02.2", "2002-02-05"],
        ["05 . 02 . 2", "2002-02-05"],
        ["05.02.20", "2020-02-05"],
        ["05.02.202", "2202-02-05"],
        ["05.02.2020", "2020-02-05"],
        ["05.02.2020", "2020-02-05"],
        ["05 . 02 . 2020", "2020-02-05"],
        ["2020.02.05", "2020-02-05"],
        ["5/2", "2020-02-05"],
        ["5   2", "2020-02-05"],
        ["5 2 ", "2020-02-05"],
        ["5   2   ", "2020-02-05"],
        ["5 2 2", "2002-02-05"],
        ["5 2 22", "2022-02-05"],
        ["5 2 222", "2222-02-05"],
        ["5 2 2222", "2222-02-05"],
        ["5   2   2222", "2222-02-05"],
        ["05 02", "2020-02-05"],
        ["05 02 ", "2020-02-05"],
        ["05 02 2", "2002-02-05"],
        ["05   02   2", "2002-02-05"],
        ["05 02 20", "2020-02-05"],
        ["05 02 202", "2202-02-05"],
        ["05 02 2020", "2020-02-05"],
        ["05 02 2020", "2020-02-05"],
        ["05   02   2020", "2020-02-05"],
        ["2020 02 05", "2020-02-05"],
        [" ", undefined],
        ["asd", undefined],
        ["2020", "2020-01-01"],
        ["5", "2020-09-05"],
        ["5/", "2020-09-05"],
        ["5-", "2020-09-05"],
        ["11", "2020-09-11"],
        ["25", "2020-09-25"],
      ];

      for (const pair of pairs) {
        expect([pair[0], LocalDate.parse(pair[0])?.toString()]).toEqual(pair);
      }
    });
  });

  describe("compare", () => {
    it("compares the dates in ascending order", () => {
      expect([a, b].sort(LocalDate.compare)).toEqual([a, b]);
      expect([b, a].sort(LocalDate.compare)).toEqual([a, b]);
    });
  });

  describe(".toEqual", () => {
    it("checks LocalDates with same date are equal", () => {
      expect(a.toEqual(new LocalDate(a.value))).toBe(true);
    });

    it("checks LocalDates with different dates are not equal", () => {
      expect(a.toEqual(b)).toBe(false);
    });

    it("checks other types of values are not equal", () => {
      expect(a.toEqual(a.value)).toBe(false);
    });
  });

  describe("daysInMonth", () => {
    it("returns number of days in the month", () => {
      expect(a.daysInMonth).toEqual(31);
    });
  });

  describe("month", () => {
    it("returns the zero-indexed month", () => {
      expect(a.month).toEqual(0);
    });
  });

  describe("dayOfMonth", () => {
    it("returns the date of the month", () => {
      expect(a.dayOfMonth).toEqual(1);
    });
  });

  describe("dayOfWeek", () => {
    it("returns the day of the week, where Monday = 1", () => {
      expect(a.dayOfWeek).toEqual(3);
    });
  });

  describe("diff", () => {
    it("if unit arg is not given, returns difference in days between the dates", () => {
      expect(a.diff(b)).toEqual(-366);
      expect(b.diff(a)).toEqual(366);
    });

    it("if returnDecimal is true, returns decimal", () => {
      expect(b.diff(a, "week")).toEqual(52);
      expect(b.diff(a, "week", true)).toEqual(52.285_714_285_714_285);
    });
  });

  describe("add", () => {
    it.each`
      startDate       | period | frequency  | endDate
      ${"2021-01-01"} | ${1}   | ${"day"}   | ${"2021-01-02"}
      ${"2021-01-01"} | ${365} | ${"day"}   | ${"2022-01-01"}
      ${"2020-01-01"} | ${366} | ${"day"}   | ${"2021-01-01"}
      ${"2021-01-01"} | ${1}   | ${"week"}  | ${"2021-01-08"}
      ${"2021-01-01"} | ${1}   | ${"month"} | ${"2021-02-01"}
      ${"2021-01-01"} | ${12}  | ${"month"} | ${"2022-01-01"}
      ${"2021-01-01"} | ${1}   | ${"year"}  | ${"2022-01-01"}
      ${"2021-01-31"} | ${1}   | ${"day"}   | ${"2021-02-01"}
      ${"2021-01-31"} | ${1}   | ${"week"}  | ${"2021-02-07"}
      ${"2021-01-31"} | ${1}   | ${"month"} | ${"2021-02-28"}
      ${"2020-01-31"} | ${1}   | ${"month"} | ${"2020-02-29"}
      ${"2021-01-31"} | ${3}   | ${"month"} | ${"2021-04-30"}
    `(
      "should move $startDate by $period $frequency to $endDate",
      ({ startDate, period, frequency, endDate }) => {
        expect(
          LocalDate.from(startDate).add(period, frequency).toString()
        ).toEqual(endDate);
      }
    );
  });

  describe("subtract", () => {
    it.each`
      startDate       | period | frequency  | endDate
      ${"2021-01-02"} | ${1}   | ${"day"}   | ${"2021-01-01"}
      ${"2022-01-01"} | ${365} | ${"day"}   | ${"2021-01-01"}
      ${"2021-01-01"} | ${366} | ${"day"}   | ${"2020-01-01"}
      ${"2021-01-08"} | ${1}   | ${"week"}  | ${"2021-01-01"}
      ${"2021-02-01"} | ${1}   | ${"month"} | ${"2021-01-01"}
      ${"2022-01-01"} | ${12}  | ${"month"} | ${"2021-01-01"}
      ${"2022-01-01"} | ${1}   | ${"year"}  | ${"2021-01-01"}
      ${"2021-02-01"} | ${1}   | ${"day"}   | ${"2021-01-31"}
      ${"2021-02-07"} | ${1}   | ${"week"}  | ${"2021-01-31"}
      ${"2021-03-31"} | ${1}   | ${"month"} | ${"2021-02-28"}
      ${"2020-03-31"} | ${1}   | ${"month"} | ${"2020-02-29"}
      ${"2021-03-31"} | ${4}   | ${"month"} | ${"2020-11-30"}
    `(
      "should move $startDate by $period $frequency to $endDate",
      ({ startDate, period, frequency, endDate }) => {
        expect(
          LocalDate.from(startDate).subtract(period, frequency).toString()
        ).toEqual(endDate);
      }
    );
  });

  it("toDate() returns Date obj that has the same date", () => {
    expect(LocalDate.from("2021-01-01").toDate().toString()).toMatch(
      "Jan 01 2021"
    );
    expect(LocalDate.from("2021-01-15").toDate().toString()).toMatch(
      "Jan 15 2021"
    );
    expect(LocalDate.from("2021-02-01").toDate().toString()).toMatch(
      "Feb 01 2021"
    );
    expect(LocalDate.from("2021-02-15").toDate().toString()).toMatch(
      "Feb 15 2021"
    );
    expect(LocalDate.from("2021-02-28").toDate().toString()).toMatch(
      "Feb 28 2021"
    );
    expect(LocalDate.from("2021-03-01").toDate().toString()).toMatch(
      "Mar 01 2021"
    );
    expect(LocalDate.from("2021-03-15").toDate().toString()).toMatch(
      "Mar 15 2021"
    );
    expect(LocalDate.from("2021-03-31").toDate().toString()).toMatch(
      "Mar 31 2021"
    );
    expect(LocalDate.from("2021-04-01").toDate().toString()).toMatch(
      "Apr 01 2021"
    );
  });

  describe("startOfDay", () => {
    it("should return a moment", () => {
      const date = LocalDate.fromString("2021-10-01");
      expect(isMoment(date.startOfDay("Australia/Sydney"))).toBeTruthy();
    });

    describe("in the Sydney timezone", () => {
      it("should be the start of the day during daylight savings", () => {
        const date = LocalDate.fromString("2021-11-02");
        const datetime = date.startOfDay("Australia/Sydney");
        expect(datetime.toISOString()).toEqual("2021-11-01T13:00:00.000Z");
      });

      it("should be the start of the day not during daylight savings", () => {
        const date = LocalDate.fromString("2021-06-02");
        const datetime = date.startOfDay("Australia/Sydney");
        expect(datetime.toISOString()).toEqual("2021-06-01T14:00:00.000Z");
      });
    });

    it("should handle various timezones", () => {
      const date = LocalDate.fromString("2021-11-02");

      const datetime1 = date.startOfDay("America/Los_Angeles");
      expect(datetime1.toISOString()).toEqual("2021-11-02T07:00:00.000Z");

      const datetime2 = date.startOfDay("Europe/Rome");
      expect(datetime2.toISOString()).toEqual("2021-11-01T23:00:00.000Z");

      const datetime3 = date.startOfDay("Pacific/Auckland");
      expect(datetime3.toISOString()).toEqual("2021-11-01T11:00:00.000Z");
    });
  });

  describe("startOfNextDay", () => {
    it("should return a moment", () => {
      const date = LocalDate.fromString("2021-10-01");
      expect(isMoment(date.startOfNextDay("Australia/Sydney"))).toBeTruthy();
    });

    it("should not mutate the local date", () => {
      const dateString = "2021-10-01";
      const date = LocalDate.fromString(dateString);
      date.startOfDay("Australia/Sydney");
      expect(date.toString()).toEqual(dateString);
    });

    describe("in the Sydney timezone", () => {
      it("should be the start of the next day during daylight savings", () => {
        const date = LocalDate.fromString("2021-11-02");
        const datetime = date.startOfNextDay("Australia/Sydney");
        expect(datetime.toISOString()).toEqual("2021-11-02T13:00:00.000Z");
      });

      it("should be the start of the next day not during daylight savings", () => {
        const date = LocalDate.fromString("2021-06-02");
        const datetime = date.startOfNextDay("Australia/Sydney");
        expect(datetime.toISOString()).toEqual("2021-06-02T14:00:00.000Z");
      });
    });

    it("should handle various timezones", () => {
      const date = LocalDate.fromString("2021-11-02");

      const datetime1 = date.startOfNextDay("America/Los_Angeles");
      expect(datetime1.toISOString()).toEqual("2021-11-03T07:00:00.000Z");

      const datetime2 = date.startOfNextDay("Europe/Rome");
      expect(datetime2.toISOString()).toEqual("2021-11-02T23:00:00.000Z");

      const datetime3 = date.startOfNextDay("Pacific/Auckland");
      expect(datetime3.toISOString()).toEqual("2021-11-02T11:00:00.000Z");
    });
  });
});
