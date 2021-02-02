/* eslint-disable unicorn/no-null */
import { getNextRecurringDate } from "./getNextRecurringDate";
import { LocalDate } from "./LocalDate";

describe("getNextRecurringDate", () => {
  describe.each`
    anniversaryDay | anniversaryMonth | startDate       | asOf            | frequency        | expected        | description
    ${27}          | ${null}          | ${null}         | ${"2020-04-27"} | ${"monthly"}     | ${"2020-05-27"} | ${"monthly cycle"}
    ${27}          | ${null}          | ${null}         | ${"2020-04-28"} | ${"monthly"}     | ${"2020-05-27"} | ${"asOf at the start of a monthly cycle"}
    ${27}          | ${1}             | ${null}         | ${"2020-05-01"} | ${"annually"}    | ${"2021-01-27"} | ${"yearly cycle"}
    ${27}          | ${1}             | ${null}         | ${"2021-01-28"} | ${"annually"}    | ${"2022-01-27"} | ${"asOf at the start of a yearly cycle"}
    ${3}           | ${null}          | ${null}         | ${"2020-11-01"} | ${"weekly"}      | ${"2020-11-04"} | ${"weekly cycle asOf Sunday"}
    ${1}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${"2020-11-09"} | ${"weekly cycle asOf Monday end day Monday"}
    ${2}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${"2020-11-03"} | ${"weekly cycle asOf Monday end day Tuesday"}
    ${3}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${"2020-11-04"} | ${"weekly cycle asOf Monday end day Wednesday"}
    ${4}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${"2020-11-05"} | ${"weekly cycle asOf Monday end day Thursday"}
    ${5}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${"2020-11-06"} | ${"weekly cycle asOf Monday end day Friday"}
    ${6}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${"2020-11-07"} | ${"weekly cycle asOf Monday end day Saturday"}
    ${7}           | ${null}          | ${null}         | ${"2020-11-02"} | ${"weekly"}      | ${"2020-11-08"} | ${"weekly cycle asOf Monday end day Sunday"}
    ${1}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${"2020-12-28"} | ${"weekly cycle near end of month asOf Saturday end day Monday"}
    ${2}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${"2020-12-29"} | ${"weekly cycle near end of month asOf Saturday end day Tuesday"}
    ${3}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${"2020-12-30"} | ${"weekly cycle near end of month asOf Saturday end day Wednesday"}
    ${4}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${"2020-12-31"} | ${"weekly cycle near end of month asOf Saturday end day Thursday"}
    ${5}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${"2021-01-01"} | ${"weekly cycle near end of month asOf Saturday end day Friday"}
    ${6}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${"2021-01-02"} | ${"weekly cycle near end of month asOf Saturday end day Saturday"}
    ${7}           | ${null}          | ${null}         | ${"2020-12-26"} | ${"weekly"}      | ${"2020-12-27"} | ${"weekly cycle near end of month asOf Saturday end day Sunday"}
    ${null}        | ${null}          | ${"2020-12-26"} | ${"2020-07-15"} | ${"fortnightly"} | ${"2020-12-26"} | ${"fortnightly cycle with start date after asOf should return start date"}
    ${null}        | ${null}          | ${"2020-07-10"} | ${"2020-07-15"} | ${"fortnightly"} | ${"2020-07-24"} | ${"fortnightly cycle with recent start date"}
    ${null}        | ${null}          | ${"2020-04-10"} | ${"2020-07-15"} | ${"fortnightly"} | ${"2020-07-17"} | ${"fortnightly cycle with less recent start date"}
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
          getNextRecurringDate({
            anniversaryDay,
            anniversaryMonth,
            startDate: startDate ? LocalDate.from(startDate) : null,
            asOf: LocalDate.from(asOf),
            frequency,
          }).toString()
        ).toEqual(expected);
      });
    }
  );
});
