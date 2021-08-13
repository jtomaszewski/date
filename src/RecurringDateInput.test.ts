/* eslint-disable unicorn/no-null */
import { LocalDate } from "./LocalDate";
import { getValidAnchorDate } from "./RecurringDateInput";

describe("getValidAnchorDate", () => {
  describe("using frequency and date", () => {
    describe("valid anchor dates", () => {
      it.each`
        startDate       | frequency
        ${"2020-01-01"} | ${"daily"}
        ${"2020-01-01"} | ${"weekly"}
        ${"2020-01-01"} | ${"fortnightly"}
        ${"2020-01-01"} | ${"monthly"}
        ${"2020-01-01"} | ${"annually"}
        ${"2020-02-29"} | ${"daily"}
        ${"2020-02-29"} | ${"weekly"}
        ${"2020-02-29"} | ${"fortnightly"}
        ${"2020-02-29"} | ${"monthly"}
        ${"2020-02-29"} | ${"annually"}
      `(
        "returns the start date: $startDate when frequency is $frequency",
        ({ startDate, frequency }) => {
          expect(
            getValidAnchorDate({ frequency, startDate }).toString()
          ).toEqual(startDate);
        }
      );
    });

    describe("invalid anchor dates", () => {
      it.each`
        startDate       | frequency
        ${"2020-13-01"} | ${"daily"}
        ${"2020-13-01"} | ${"weekly"}
        ${"2020-13-01"} | ${"fortnightly"}
        ${"2020-13-01"} | ${"monthly"}
        ${"2020-13-01"} | ${"annually"}
        ${"2021-02-29"} | ${"daily"}
        ${"2021-02-29"} | ${"weekly"}
        ${"2021-02-29"} | ${"fortnightly"}
        ${"2021-02-29"} | ${"monthly"}
        ${"2021-02-29"} | ${"annually"}
      `(
        "throws an error for date: $startDate and frequency: $frequency",
        ({ startDate, frequency }) => {
          expect(() =>
            getValidAnchorDate({ frequency, startDate })
          ).toThrowError();
        }
      );
    });
  });

  describe("using anniversaries", () => {
    describe("weekly", () => {
      const frequency = "weekly";

      describe("valid anniversaries", () => {
        const validAnniversaries = range(7, 1);

        it.each(validAnniversaries)(
          "for anniversaryDay: %p gives a matching anchorDate",
          (anniversaryDay) => {
            expect(
              getValidAnchorDate({ frequency, anniversaryDay }).dayOfWeek
            ).toEqual(anniversaryDay);
          }
        );
      });

      describe("invalid anniversaries", () => {
        const invalidAnniversaries = [null, undefined, -1, 0, 8];

        it.each(invalidAnniversaries)(
          "for anniversaryDay: %p it throws an error",
          (anniversaryDay) => {
            expect(() =>
              getValidAnchorDate({ frequency, anniversaryDay })
            ).toThrowError();
          }
        );
      });
    });

    describe("monthly", () => {
      const frequency = "monthly";

      describe("valid anniversaries", () => {
        const validAnniversaries = range(31, 1);
        it.each(validAnniversaries)(
          "for anniversaryDay: %p gives a matching anchorDate",
          (anniversaryDay) => {
            expect(
              getValidAnchorDate({ frequency, anniversaryDay }).dayOfMonth
            ).toEqual(anniversaryDay);
          }
        );
      });

      describe("invalid anniversaries", () => {
        const invalidAnniversaries = [null, undefined, -1, 0, 32];

        it.each(invalidAnniversaries)(
          "for anniversaryDay: %p it throws an error",
          (anniversaryDay) => {
            expect(() =>
              getValidAnchorDate({ frequency, anniversaryDay })
            ).toThrowError();
          }
        );
      });
    });

    describe("annually", () => {
      const frequency = "annually";
      const validMonths = range(12, 1);
      const invalidMonths = [undefined, null, -1, 0, 13];

      describe.each(validMonths)("for valid month %p", (anniversaryMonth) => {
        const dateInMonth = LocalDate.from("2000-01-01").setMonth(
          anniversaryMonth - 1
        );

        describe("valid anniversaries", () => {
          const validAnniversaries = range(dateInMonth.daysInMonth, 1);
          it.each(validAnniversaries)(
            "for anniversaryDay: %p gives a matching anchorDate",
            (anniversaryDay) => {
              const anchorDate = getValidAnchorDate({
                frequency,
                anniversaryMonth,
                anniversaryDay,
              });
              expect(anchorDate.dayOfMonth).toEqual(anniversaryDay);
              expect(anchorDate.month).toEqual(anniversaryMonth - 1);
            }
          );
        });

        describe("invalid anniversaries", () => {
          const invalidAnniversaries = [
            undefined,
            null,
            -1,
            0,
            dateInMonth.daysInMonth + 1,
          ];

          it.each(invalidAnniversaries)(
            "for anniversaryDay: %p it throws an error",
            (anniversaryDay) => {
              expect(() =>
                getValidAnchorDate({
                  frequency,
                  anniversaryMonth,
                  anniversaryDay,
                })
              ).toThrowError();
            }
          );
        });
      });

      describe.each(invalidMonths)(
        "for invalid month %p",
        (anniversaryMonth) => {
          const anniversaryDay = 1;
          it("throws an error", () => {
            expect(() =>
              getValidAnchorDate({
                frequency,
                anniversaryMonth,
                anniversaryDay,
              })
            ).toThrowError();
          });
        }
      );
    });
  });
});

function range(size: number, startAt: number = 0): ReadonlyArray<number> {
  return [...Array.from({ length: size }).keys()].map((i) => i + startAt);
}
