/* eslint-disable unicorn/no-null */
import { DateRange } from "./DateRange";
import { LocalDate } from "./LocalDate";
import { RecurringDate } from "./RecurringDate";

const dailyRecurringDate = new RecurringDate({
  frequency: "daily",
});

describe("RecurringDate", () => {
  describe("getNextOccurrence", () => {
    describe.each`
      startDate       | frequency        | asOf            | inclusive | expectedNext    | expectedPrevious | description
      ${"2019-01-27"} | ${"daily"}       | ${"2020-04-27"} | ${false}  | ${"2020-04-28"} | ${"2020-04-26"}  | ${"daily cycle"}
      ${"2019-01-27"} | ${"daily"}       | ${"2020-04-27"} | ${true}   | ${"2020-04-27"} | ${"2020-04-27"}  | ${"daily cycle returns same day if inclusive"}
      ${"2019-01-27"} | ${"monthly"}     | ${"2020-04-27"} | ${false}  | ${"2020-05-27"} | ${"2020-03-27"}  | ${"monthly cycle"}
      ${"2019-01-27"} | ${"monthly"}     | ${"2020-04-27"} | ${true}   | ${"2020-04-27"} | ${"2020-04-27"}  | ${"monthly cycle returns same day if inclusive and occurrence today"}
      ${"2019-01-27"} | ${"monthly"}     | ${"2020-04-28"} | ${false}  | ${"2020-05-27"} | ${"2020-04-27"}  | ${"asOf at the start of a monthly cycle"}
      ${"2019-01-27"} | ${"monthly"}     | ${"2020-04-28"} | ${true}   | ${"2020-05-27"} | ${"2020-04-27"}  | ${"returns next occurrence if inclusive is true and no occurrence today"}
      ${"2019-01-27"} | ${"monthly"}     | ${"2020-04-28"} | ${false}  | ${"2020-05-27"} | ${"2020-04-27"}  | ${"create monthly cycle"}
      ${"2019-01-31"} | ${"monthly"}     | ${"2020-02-15"} | ${false}  | ${"2020-02-29"} | ${"2020-01-31"}  | ${"create end of month monthly cycle"}
      ${"2019-01-27"} | ${"annually"}    | ${"2020-05-01"} | ${false}  | ${"2021-01-27"} | ${"2020-01-27"}  | ${"yearly cycle"}
      ${"2019-01-27"} | ${"annually"}    | ${"2021-01-28"} | ${false}  | ${"2022-01-27"} | ${"2021-01-27"}  | ${"asOf at the start of a yearly cycle"}
      ${"2019-01-27"} | ${"annually"}    | ${"2021-01-27"} | ${true}   | ${"2021-01-27"} | ${"2021-01-27"}  | ${"annual with occurrence on asOf with inclusive"}
      ${"2019-01-27"} | ${"annually"}    | ${"2021-01-27"} | ${false}  | ${"2022-01-27"} | ${"2020-01-27"}  | ${"annual with occurrence on asOf without inclusive"}
      ${"2020-02-29"} | ${"annually"}    | ${"2020-02-29"} | ${false}  | ${"2021-02-28"} | ${"2019-02-28"}  | ${"annual with occurrence on leap year"}
      ${"2020-06-01"} | ${"weekly"}      | ${"2020-11-02"} | ${false}  | ${"2020-11-09"} | ${"2020-10-26"}  | ${"weekly cycle asOf Monday start day Monday exclusive"}
      ${"2020-06-01"} | ${"weekly"}      | ${"2020-11-02"} | ${true}   | ${"2020-11-02"} | ${"2020-11-02"}  | ${"weekly cycle asOf Monday start day Monday inclusive"}
      ${"2020-06-02"} | ${"weekly"}      | ${"2020-12-26"} | ${false}  | ${"2020-12-29"} | ${"2020-12-22"}  | ${"weekly cycle asOf Saturday start day Tuesday"}
      ${"2020-06-03"} | ${"weekly"}      | ${"2020-12-26"} | ${false}  | ${"2020-12-30"} | ${"2020-12-23"}  | ${"weekly cycle asOf Saturday start day Wednesday"}
      ${"2020-06-04"} | ${"weekly"}      | ${"2020-12-26"} | ${false}  | ${"2020-12-31"} | ${"2020-12-24"}  | ${"weekly cycle asOf Saturday start day Thursday"}
      ${"2020-06-05"} | ${"weekly"}      | ${"2020-12-26"} | ${false}  | ${"2021-01-01"} | ${"2020-12-25"}  | ${"weekly cycle asOf Saturday start day Friday"}
      ${"2020-06-06"} | ${"weekly"}      | ${"2020-12-26"} | ${false}  | ${"2021-01-02"} | ${"2020-12-19"}  | ${"weekly cycle asOf Saturday start day Saturday"}
      ${"2020-06-07"} | ${"weekly"}      | ${"2020-12-26"} | ${false}  | ${"2020-12-27"} | ${"2020-12-20"}  | ${"weekly cycle asOf Saturday start day Sunday"}
      ${"2020-08-22"} | ${"fortnightly"} | ${"2020-07-15"} | ${false}  | ${"2020-07-25"} | ${"2020-07-11"}  | ${"fortnightly cycle with start date after asOf"}
      ${"2020-07-10"} | ${"fortnightly"} | ${"2020-07-15"} | ${false}  | ${"2020-07-24"} | ${"2020-07-10"}  | ${"fortnightly cycle with recent start date"}
      ${"2020-07-15"} | ${"fortnightly"} | ${"2020-07-15"} | ${false}  | ${"2020-07-29"} | ${"2020-07-01"}  | ${"fortnightly cycle asOf start date"}
      ${"2020-07-15"} | ${"fortnightly"} | ${"2020-07-15"} | ${true}   | ${"2020-07-15"} | ${"2020-07-15"}  | ${"fortnightly cycle returns same day if inclusive and occurrence today"}
      ${"2020-04-10"} | ${"fortnightly"} | ${"2020-07-15"} | ${false}  | ${"2020-07-17"} | ${"2020-07-03"}  | ${"fortnightly cycle with less recent start date"}
    `(
      "$description",
      ({
        startDate,
        asOf,
        frequency,
        expectedNext,
        expectedPrevious,
        inclusive,
      }) => {
        const recurringDate = new RecurringDate({
          frequency,
          startDate: LocalDate.from(startDate),
        });

        it(`should return next occurrence ${expectedNext}`, () => {
          expect(
            recurringDate
              .getNextOccurrence(LocalDate.from(asOf), { inclusive })
              .toString()
          ).toEqual(expectedNext);
        });

        it(`should return previous occurrence ${expectedPrevious}`, () => {
          expect(
            recurringDate
              .getPreviousOccurrence(LocalDate.from(asOf), { inclusive })
              .toString()
          ).toEqual(expectedPrevious);
        });
      }
    );
  });

  describe("hasOccurrenceOn", () => {
    describe.each`
      startDate       | frequency        | asOf            | expected | description
      ${"2019-01-27"} | ${"daily"}       | ${"2020-04-27"} | ${true}  | ${"monthly cycle"}
      ${"2020-07-27"} | ${"monthly"}     | ${"2020-04-27"} | ${true}  | ${"monthly cycle"}
      ${"2020-01-31"} | ${"monthly"}     | ${"2020-04-30"} | ${true}  | ${"monthly cycle"}
      ${"2020-01-31"} | ${"monthly"}     | ${"2020-02-29"} | ${true}  | ${"end of next month"}
      ${"2020-02-29"} | ${"monthly"}     | ${"2020-01-30"} | ${false} | ${"not quite end of next month"}
      ${"2020-04-30"} | ${"monthly"}     | ${"2020-01-31"} | ${false} | ${"not quite end of next month"}
      ${"2020-07-27"} | ${"monthly"}     | ${"2020-04-28"} | ${false} | ${"asOf at the start of a monthly cycle"}
      ${"2020-05-27"} | ${"annually"}    | ${"2020-05-27"} | ${true}  | ${"yearly cycle"}
      ${"2020-05-27"} | ${"annually"}    | ${"2021-09-27"} | ${false} | ${"asOf at the start of a yearly cycle"}
      ${"2020-06-02"} | ${"weekly"}      | ${"2020-11-03"} | ${true}  | ${"weekly cycle asOf Sunday"}
      ${"2020-06-02"} | ${"weekly"}      | ${"2020-11-06"} | ${false} | ${"weekly cycle asOf Monday end day Monday"}
      ${"2020-07-10"} | ${"fortnightly"} | ${"2020-07-10"} | ${true}  | ${"fortnightly cycle with recent start date"}
      ${"2020-07-10"} | ${"fortnightly"} | ${"2020-07-01"} | ${false} | ${"fortnightly cycle asOf start date"}
    `("$description", ({ startDate, asOf, frequency, expected }) => {
      it(`should return ${expected}`, () => {
        expect(
          new RecurringDate({
            frequency,
            startDate: LocalDate.from(startDate),
          }).hasOccurrenceOn(LocalDate.from(asOf))
        ).toEqual(expected);
      });
    });
  });

  describe("getNextOccurrenceInDateRange", () => {
    it("if next occurrence fits in the end date period, returns it", () => {
      const value1 = dailyRecurringDate.getNextOccurrenceInDateRange(
        new DateRange(LocalDate.yesterday(), LocalDate.tomorrow())
      )!;
      expect(value1.toString()).toEqual(LocalDate.tomorrow().toString());

      const value2 = dailyRecurringDate.getNextOccurrenceInDateRange(
        new DateRange(LocalDate.yesterday(), LocalDate.tomorrow().add(1, "day"))
      )!;
      expect(value2.toString()).toEqual(LocalDate.tomorrow().toString());
    });

    it("if next occurrence doesnt fit in the end date period, returns undefined", () => {
      const value = dailyRecurringDate.getNextOccurrenceInDateRange(
        new DateRange(LocalDate.yesterday(), LocalDate.today())
      );
      expect(value).toEqual(undefined);
    });

    it("if end date is not given, returns next occurrence", () => {
      const value = dailyRecurringDate.getNextOccurrenceInDateRange(
        new DateRange(LocalDate.yesterday())
      )!;
      expect(value.toString()).toEqual(LocalDate.tomorrow().toString());
    });

    it("if date range is in the future, returns first occurrence in it", () => {
      const value = dailyRecurringDate.getNextOccurrenceInDateRange(
        new DateRange(LocalDate.tomorrow(), LocalDate.tomorrow().add(1, "day"))
      )!;
      expect(value.toString()).toEqual(LocalDate.tomorrow().toString());
    });
  });

  describe("getOccurrencesInDateRange", () => {
    it("if called with infinite date range and a limit, returns occurrences up to the limit", () => {
      expect(
        dailyRecurringDate
          .getOccurrencesInDateRange(
            new DateRange(LocalDate.from("2000-01-01")),
            5
          )
          .map((d) => d.toString())
      ).toEqual([
        "2000-01-01",
        "2000-01-02",
        "2000-01-03",
        "2000-01-04",
        "2000-01-05",
      ]);
    });

    it("if called with finite date range and a limit, returns occurrences up to the limit", () => {
      expect(
        dailyRecurringDate
          .getOccurrencesInDateRange(
            new DateRange(
              LocalDate.from("2000-01-01"),
              LocalDate.from("2000-12-31")
            ),
            5
          )
          .map((d) => d.toString())
      ).toEqual([
        "2000-01-01",
        "2000-01-02",
        "2000-01-03",
        "2000-01-04",
        "2000-01-05",
      ]);
    });

    it("if called with finite date range and no limit, returns occurrences up to the end of the date range", () => {
      expect(
        dailyRecurringDate
          .getOccurrencesInDateRange(
            new DateRange(
              LocalDate.from("2000-01-01"),
              LocalDate.from("2000-01-05")
            )
          )
          .map((d) => d.toString())
      ).toEqual([
        "2000-01-01",
        "2000-01-02",
        "2000-01-03",
        "2000-01-04",
        "2000-01-05",
      ]);
    });

    it("if called with infinite date range and no limit, throws an error", () => {
      expect(() =>
        dailyRecurringDate.getOccurrencesInDateRange(
          new DateRange(LocalDate.from("2000-01-01"))
        )
      ).toThrowError(
        `getOccurrencesInDateRange() has been called with no \`limit\` while it would return more than 100 elements. Breaking...`
      );
    });

    describe("when monthly recurring date happens at the end of the month", () => {
      it("return end of month dates when on the 31st", () => {
        const endOfMonthRecurringDate = new RecurringDate({
          frequency: "monthly",
          anniversaryDay: 31,
        });
        expect(
          endOfMonthRecurringDate
            .getOccurrencesInDateRange(
              new DateRange(LocalDate.from("2001-01-02")),
              12
            )
            .map((d) => d.toString())
        ).toEqual([
          "2001-01-31",
          "2001-02-28",
          "2001-03-31",
          "2001-04-30",
          "2001-05-31",
          "2001-06-30",
          "2001-07-31",
          "2001-08-31",
          "2001-09-30",
          "2001-10-31",
          "2001-11-30",
          "2001-12-31",
        ]);
      });

      it("return end of month date for feb when on the 30th", () => {
        const endOfMonthRecurringDate = new RecurringDate({
          frequency: "monthly",
          anniversaryDay: 30,
        });
        expect(
          endOfMonthRecurringDate
            .getOccurrencesInDateRange(
              new DateRange(LocalDate.from("2001-01-01")),
              12
            )
            .map((d) => d.toString())
        ).toEqual([
          "2001-01-30",
          "2001-02-28",
          "2001-03-30",
          "2001-04-30",
          "2001-05-30",
          "2001-06-30",
          "2001-07-30",
          "2001-08-30",
          "2001-09-30",
          "2001-10-30",
          "2001-11-30",
          "2001-12-30",
        ]);
      });

      it("return end of month date for feb when on the 29th and not a leap year", () => {
        const endOfMonthRecurringDate = new RecurringDate({
          frequency: "monthly",
          anniversaryDay: 29,
        });
        expect(
          endOfMonthRecurringDate
            .getOccurrencesInDateRange(
              new DateRange(LocalDate.from("2001-01-01")),
              12
            )
            .map((d) => d.toString())
        ).toEqual([
          "2001-01-29",
          "2001-02-28",
          "2001-03-29",
          "2001-04-29",
          "2001-05-29",
          "2001-06-29",
          "2001-07-29",
          "2001-08-29",
          "2001-09-29",
          "2001-10-29",
          "2001-11-29",
          "2001-12-29",
        ]);
      });
    });

    describe("when annual recurring date happens on Feb 29", () => {
      it("returns Feb 29 in leap years otherwise Feb 28", () => {
        const endOfMonthRecurringDate = new RecurringDate({
          frequency: "annually",
          anniversaryMonth: 2,
          anniversaryDay: 29,
        });
        expect(
          endOfMonthRecurringDate
            .getOccurrencesInDateRange(
              new DateRange(LocalDate.from("2096-01-01")),
              9
            )
            .map((d) => d.toString())
        ).toEqual([
          "2096-02-29",
          "2097-02-28",
          "2098-02-28",
          "2099-02-28",
          "2100-02-28", // Not a leap year
          "2101-02-28",
          "2102-02-28",
          "2103-02-28",
          "2104-02-29",
        ]);
      });
    });
  });
});
