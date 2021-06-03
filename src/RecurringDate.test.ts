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
      anniversaryDay | anniversaryMonth | startDate       | asOf            | frequency        | inclusive | expectedNext    | expectedPrevious | description
      ${null}        | ${null}          | ${null}         | ${"2020-04-27"} | ${"daily"}       | ${false}  | ${"2020-04-28"} | ${"2020-04-26"}  | ${"daily cycle"}
      ${null}        | ${null}          | ${null}         | ${"2020-04-27"} | ${"daily"}       | ${true}   | ${"2020-04-27"} | ${"2020-04-27"}  | ${"daily cycle returns same day if inclusive"}
      ${27}          | ${null}          | ${null}         | ${"2020-04-27"} | ${"monthly"}     | ${false}  | ${"2020-05-27"} | ${"2020-03-27"}  | ${"monthly cycle"}
      ${27}          | ${null}          | ${null}         | ${"2020-04-27"} | ${"monthly"}     | ${true}   | ${"2020-04-27"} | ${"2020-04-27"}  | ${"monthly cycle returns same day if inclusive and occurrence today"}
      ${27}          | ${null}          | ${null}         | ${"2020-04-28"} | ${"monthly"}     | ${false}  | ${"2020-05-27"} | ${"2020-04-27"}  | ${"asOf at the start of a monthly cycle"}
      ${27}          | ${null}          | ${null}         | ${"2020-04-28"} | ${"monthly"}     | ${true}   | ${"2020-05-27"} | ${"2020-04-27"}  | ${"returns next occurrence if inclusive is true and no occurrence today"}
      ${null}        | ${null}          | ${"2019-01-27"} | ${"2020-04-28"} | ${"monthly"}     | ${false}  | ${"2020-05-27"} | ${"2020-04-27"}  | ${"create monthly cycle from date"}
      ${27}          | ${1}             | ${null}         | ${"2020-05-01"} | ${"annually"}    | ${false}  | ${"2021-01-27"} | ${"2020-01-27"}  | ${"yearly cycle"}
      ${27}          | ${1}             | ${null}         | ${"2021-01-28"} | ${"annually"}    | ${false}  | ${"2022-01-27"} | ${"2021-01-27"}  | ${"asOf at the start of a yearly cycle"}
      ${27}          | ${1}             | ${null}         | ${"2021-01-27"} | ${"annually"}    | ${true}   | ${"2021-01-27"} | ${"2021-01-27"}  | ${"annual with occurrence on asOf with inclusive"}
      ${27}          | ${1}             | ${null}         | ${"2021-01-27"} | ${"annually"}    | ${false}  | ${"2022-01-27"} | ${"2020-01-27"}  | ${"annual with occurrence on asOf without inclusive"}
      ${null}        | ${null}          | ${"3000-03-05"} | ${"2021-05-28"} | ${"annually"}    | ${false}  | ${"2022-03-05"} | ${"2021-03-05"}  | ${"create yearly cycle from date"}
      ${3}           | ${null}          | ${null}         | ${"2020-11-01"} | ${"weekly"}      | ${false}  | ${"2020-11-04"} | ${"2020-10-28"}  | ${"weekly cycle asOf Sunday"}
      ${1}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-09"} | ${"2020-10-26"}  | ${"weekly cycle asOf Monday end day Monday"}
      ${1}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${true}   | ${"2020-11-02"} | ${"2020-11-02"}  | ${"weekly cycle returns same day if inclusive and occurrence today"}
      ${null}        | ${null}          | ${"2020-11-09"} | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-09"} | ${"2020-10-26"}  | ${"weekly cycle with start date exactly one week ahead"}
      ${null}        | ${null}          | ${"2020-11-10"} | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-03"} | ${"2020-10-27"}  | ${"weekly cycle with start date eight days ahead"}
      ${null}        | ${null}          | ${"2020-11-01"} | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-08"} | ${"2020-11-01"}  | ${"weekly cycle with start date day before"}
      ${null}        | ${null}          | ${"2020-10-26"} | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-09"} | ${"2020-10-26"}  | ${"weekly cycle with start date exactly one week before"}
      ${2}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-03"} | ${"2020-10-27"}  | ${"weekly cycle asOf Monday end day Tuesday"}
      ${3}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-04"} | ${"2020-10-28"}  | ${"weekly cycle asOf Monday end day Wednesday"}
      ${4}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-05"} | ${"2020-10-29"}  | ${"weekly cycle asOf Monday end day Thursday"}
      ${5}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-06"} | ${"2020-10-30"}  | ${"weekly cycle asOf Monday end day Friday"}
      ${6}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-07"} | ${"2020-10-31"}  | ${"weekly cycle asOf Monday end day Saturday"}
      ${7}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${false}  | ${"2020-11-08"} | ${"2020-11-01"}  | ${"weekly cycle asOf Monday end day Sunday"}
      ${1}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${false}  | ${"2020-12-28"} | ${"2020-12-21"}  | ${"weekly cycle near end of month asOf Saturday end day Monday"}
      ${2}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${false}  | ${"2020-12-29"} | ${"2020-12-22"}  | ${"weekly cycle near end of month asOf Saturday end day Tuesday"}
      ${3}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${false}  | ${"2020-12-30"} | ${"2020-12-23"}  | ${"weekly cycle near end of month asOf Saturday end day Wednesday"}
      ${4}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${false}  | ${"2020-12-31"} | ${"2020-12-24"}  | ${"weekly cycle near end of month asOf Saturday end day Thursday"}
      ${5}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${false}  | ${"2021-01-01"} | ${"2020-12-25"}  | ${"weekly cycle near end of month asOf Saturday end day Friday"}
      ${6}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${false}  | ${"2021-01-02"} | ${"2020-12-19"}  | ${"weekly cycle near end of month asOf Saturday end day Saturday"}
      ${7}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${false}  | ${"2020-12-27"} | ${"2020-12-20"}  | ${"weekly cycle near end of month asOf Saturday end day Sunday"}
      ${null}        | ${null}          | ${"2020-08-22"} | ${"2020-07-15"} | ${"fortnightly"} | ${false}  | ${"2020-07-25"} | ${"2020-07-11"}  | ${"fortnightly cycle with start date after asOf"}
      ${null}        | ${null}          | ${"2020-07-10"} | ${"2020-07-15"} | ${"fortnightly"} | ${false}  | ${"2020-07-24"} | ${"2020-07-10"}  | ${"fortnightly cycle with recent start date"}
      ${null}        | ${null}          | ${"2020-07-15"} | ${"2020-07-15"} | ${"fortnightly"} | ${false}  | ${"2020-07-29"} | ${"2020-07-01"}  | ${"fortnightly cycle asOf start date"}
      ${null}        | ${null}          | ${"2020-07-15"} | ${"2020-07-15"} | ${"fortnightly"} | ${true}   | ${"2020-07-15"} | ${"2020-07-15"}  | ${"fortnightly cycle returns same day if inclusive and occurrence today"}
      ${null}        | ${null}          | ${"2020-04-10"} | ${"2020-07-15"} | ${"fortnightly"} | ${false}  | ${"2020-07-17"} | ${"2020-07-03"}  | ${"fortnightly cycle with less recent start date"}
    `(
      "$description",
      ({
        anniversaryDay,
        anniversaryMonth,
        startDate,
        asOf,
        frequency,
        expectedNext,
        expectedPrevious,
        inclusive,
      }) => {
        const recurringDate = new RecurringDate({
          anniversaryDay,
          anniversaryMonth,
          startDate: startDate ? LocalDate.from(startDate) : null,
          frequency,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

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
      anniversaryDay | anniversaryMonth | startDate       | asOf            | frequency        | expected | description
      ${null}        | ${null}          | ${null}         | ${"2020-04-27"} | ${"daily"}       | ${true}  | ${"monthly cycle"}
      ${27}          | ${null}          | ${null}         | ${"2020-04-27"} | ${"monthly"}     | ${true}  | ${"monthly cycle"}
      ${27}          | ${null}          | ${null}         | ${"2020-04-28"} | ${"monthly"}     | ${false} | ${"asOf at the start of a monthly cycle"}
      ${27}          | ${5}             | ${null}         | ${"2020-05-27"} | ${"annually"}    | ${true}  | ${"yearly cycle"}
      ${27}          | ${5}             | ${null}         | ${"2021-09-27"} | ${"annually"}    | ${false} | ${"asOf at the start of a yearly cycle"}
      ${2}           | ${null}          | ${null}         | ${"2020-11-03"} | ${"weekly"}      | ${true}  | ${"weekly cycle asOf Sunday"}
      ${2}           | ${null}          | ${null}         | ${"2020-11-06"} | ${"weekly"}      | ${false} | ${"weekly cycle asOf Monday end day Monday"}
      ${null}        | ${null}          | ${"2020-07-15"} | ${"2020-07-15"} | ${"fortnightly"} | ${true}  | ${"fortnightly cycle with recent start date"}
      ${null}        | ${null}          | ${"2020-07-10"} | ${"2020-07-15"} | ${"fortnightly"} | ${false} | ${"fortnightly cycle asOf start date"}
    `(
      "$description",
      ({
        anniversaryDay,
        anniversaryMonth,
        startDate,
        asOf,
        frequency,
        expected,
      }) => {
        it(`should return ${expected}`, () => {
          expect(
            new RecurringDate({
              anniversaryDay,
              anniversaryMonth,
              startDate: startDate ? LocalDate.from(startDate) : null,

              frequency,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any).hasOccurrenceOn(LocalDate.from(asOf))
          ).toEqual(expected);
        });
      }
    );
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
  });
});
