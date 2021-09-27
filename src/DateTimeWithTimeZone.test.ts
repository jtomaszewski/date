import MockDate from "mockdate";
import { DateTimeWithTimeZone } from "./DateTimeWithTimeZone";

beforeEach(() => {
  MockDate.reset();
});

describe("nextNthMonthDay", () => {
  describe("when on the nth day and asking for the next nth day", () => {
    it("should return the same day for days in the middle of the month", () => {
      const date = DateTimeWithTimeZone.from("2020-03-15T13:00:00");
      const formattedDate = date.nextNthMonthDay(15).format("DD MMMM YYYY");
      expect(formattedDate).toEqual("15 March 2020");
    });

    it("should return the same day for days at the end of the month", () => {
      const date = DateTimeWithTimeZone.from("2019-02-28T13:00:00");
      const formattedDate = date.nextNthMonthDay(28).format("DD MMMM YYYY");
      expect(formattedDate).toEqual("28 February 2019");
    });

    it("should return the same day for days at the start of the month", () => {
      const date = DateTimeWithTimeZone.from("2020-03-01T13:00:00");
      const formattedDate = date.nextNthMonthDay(1).format("DD MMMM YYYY");
      expect(formattedDate).toEqual("01 March 2020");
    });
  });

  describe("when asking for an earlier day of the month", () => {
    it("should get that day of the next month", () => {
      const date = DateTimeWithTimeZone.from("2020-03-07T13:00:00");
      const formattedDate = date.nextNthMonthDay(3).format("DD MMMM YYYY");
      expect(formattedDate).toEqual("03 April 2020");
    });
  });

  describe("when asking for a later day of the month", () => {
    it("should get that day of the this month", () => {
      const date = DateTimeWithTimeZone.from("2020-03-07T13:00:00");
      const formattedDate = date.nextNthMonthDay(21).format("DD MMMM YYYY");
      expect(formattedDate).toEqual("21 March 2020");
    });
  });

  describe("when asking for the end of March from the beginning of the March", () => {
    it("should get that day of the this month", () => {
      const date = DateTimeWithTimeZone.from("2020-03-01T13:00:00");
      const formattedDate = date.nextNthMonthDay(28).format("DD MMMM YYYY");
      expect(formattedDate).toEqual("28 March 2020");
    });
  });
});

describe("now", () => {
  beforeEach(() => {
    MockDate.set("2020-09-27T10:21:23");
  });

  it("should return the current time", () => {
    const nowFormatted = DateTimeWithTimeZone.now().format("DD MMMM YYYY");
    expect(nowFormatted).toEqual("27 September 2020");
  });
});

describe("format", () => {
  beforeEach(() => {
    MockDate.set("2020-09-27T22:21:23");
  });

  it("formats correctly all supported datetime formats", () => {
    const now = DateTimeWithTimeZone.now();
    expect(now.format("DD MMM YYYY h:mm A")).toEqual("27 Sep 2020 10:21 PM");
    expect(now.format("DD/MM/YYYY, HH:mm:ss")).toEqual("27/09/2020, 22:21:23");
    expect(now.format("h:mma D MMM YYYY")).toEqual("10:21pm 27 Sep 2020");
  });
});

describe("isOverdue", () => {
  const today = "2020-09-27T10:21:23";

  beforeEach(() => {
    MockDate.set(today);
  });

  describe("when today is before the due date", () => {
    it("should return false", () => {
      const dueDate = "2020-09-30T13:00:00";
      const date = DateTimeWithTimeZone.from(dueDate);
      expect(date.isOverdue()).toEqual(false);
    });
  });
  describe("when today is past the due date", () => {
    it("should return true", () => {
      const dueDate = "2020-09-17T13:00:00";
      const date = DateTimeWithTimeZone.from(dueDate);
      expect(date.isOverdue()).toEqual(true);
    });
  });
});

describe("fromDateSubtractingAMillisecond and friendlyFormat", () => {
  describe("when due date is at midnight Sydney time", () => {
    const dueTimestamp = "2020-02-07T13:00:00Z";
    const dueDate = DateTimeWithTimeZone.fromDateSubtractingAMillisecond(
      dueTimestamp
    );

    describe("when it's an hour before due", () => {
      beforeEach(() => {
        MockDate.set("2020-02-07T12:00:00Z");
      });

      it("should tell me my rent is due today", () => {
        const message = dueDate.friendlyFormat();

        expect(message).toEqual("today");
      });
    });

    describe("when it's 24 hours before due", () => {
      beforeEach(() => {
        MockDate.set("2020-02-06T13:00:00Z");
      });

      it("should tell me my rent is due today", () => {
        const message = dueDate.friendlyFormat();

        expect(message).toEqual("today");
      });
    });

    describe("when it's the day before it's due", () => {
      beforeEach(() => {
        MockDate.set("2020-02-06T01:00:00Z");
      });

      it("should tell me my rent is due tomorrow", () => {
        const message = dueDate.friendlyFormat();

        expect(message).toEqual("tomorrow");
      });
    });

    describe("when it's the week before it's due", () => {
      beforeEach(() => {
        MockDate.set("2020-02-01T01:00:00Z");
      });

      it("should tell me the day my rent is due", () => {
        const message = dueDate.friendlyFormat();

        expect(message).toEqual("Friday");
      });
    });

    describe("when it's more than a week before it's due", () => {
      beforeEach(() => {
        MockDate.set("2020-01-30T01:00:00Z");
      });

      it("should tell me the date my rent is due", () => {
        const message = dueDate.friendlyFormat();

        expect(message).toEqual("Fri, 07 Feb");
      });
    });

    describe("when it's just past the due date", () => {
      beforeEach(() => {
        MockDate.set("2020-02-07T13:00:00Z");
      });

      it("should tell me the date my rent is due", () => {
        const message = dueDate.friendlyFormat();

        expect(message).toEqual("yesterday");
      });
    });

    describe("when it's past the due date", () => {
      beforeEach(() => {
        MockDate.set("2020-02-08T13:00:00Z");
      });

      it("should tell me the date my rent is due", () => {
        const message = dueDate.friendlyFormat();

        expect(message).toEqual("Fri, 07 Feb");
      });
    });
  });
});

describe.each`
  today
  ${"2020-09-15T00:00:00+1000"}
  ${"2020-09-15T16:20:00+1000"}
  ${"2020-09-15T23:59:59+1000"}
`("daysBeforeToday", ({ today }) => {
  beforeEach(() => {
    MockDate.set(today);
  });

  describe("when date is before today", () => {
    it("should return positive integer", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-14T00:00:00+1000").daysBeforeToday()
      ).toEqual(1);
      expect(
        DateTimeWithTimeZone.from("2020-09-14T23:59:59+1000").daysBeforeToday()
      ).toEqual(1);
      expect(DateTimeWithTimeZone.from("2020-09-14").daysBeforeToday()).toEqual(
        1
      );
    });
  });
  describe("when date is after today", () => {
    it("should return negative integer", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-16T00:00:00+1000").daysBeforeToday()
      ).toEqual(-1);
      expect(
        DateTimeWithTimeZone.from("2020-09-16T23:59:59+1000").daysBeforeToday()
      ).toEqual(-1);
      expect(DateTimeWithTimeZone.from("2020-09-16").daysBeforeToday()).toEqual(
        -1
      );
    });
  });
  describe("when date is the same as today", () => {
    it("should return zero", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-15T00:00:00+1000").daysBeforeToday()
      ).toEqual(0);
      expect(
        DateTimeWithTimeZone.from("2020-09-15T23:59:59+1000").daysBeforeToday()
      ).toEqual(0);
      expect(DateTimeWithTimeZone.from("2020-09-15").daysBeforeToday()).toEqual(
        0
      );
    });
  });
});

describe.each`
  today
  ${"2020-09-15T00:00:00+1000"}
  ${"2020-09-15T16:20:00+1000"}
  ${"2020-09-15T23:59:59+1000"}
`("daysAfterToday", ({ today }) => {
  beforeEach(() => {
    MockDate.set(today);
  });

  // eslint-disable-next-line jest/no-identical-title
  describe("when date is before today", () => {
    it("should return negative integer", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-14T00:00:00+1000").daysAfterToday()
      ).toEqual(-1);
      expect(
        DateTimeWithTimeZone.from("2020-09-14T23:59:59+1000").daysAfterToday()
      ).toEqual(-1);
      expect(DateTimeWithTimeZone.from("2020-09-14").daysAfterToday()).toEqual(
        -1
      );
    });
  });

  // eslint-disable-next-line jest/no-identical-title
  describe("when date is after today", () => {
    it("should return positive integer", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-16T00:00:00+1000").daysAfterToday()
      ).toEqual(1);
      expect(
        DateTimeWithTimeZone.from("2020-09-16T23:59:59+1000").daysAfterToday()
      ).toEqual(1);
      expect(DateTimeWithTimeZone.from("2020-09-16").daysAfterToday()).toEqual(
        1
      );
    });
  });

  // eslint-disable-next-line jest/no-identical-title
  describe("when date is the same as today", () => {
    it("should return zero", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-15T00:00:00+1000").daysAfterToday()
      ).toEqual(0);
      expect(
        DateTimeWithTimeZone.from("2020-09-15T23:59:59+1000").daysAfterToday()
      ).toEqual(0);
      expect(DateTimeWithTimeZone.from("2020-09-15").daysAfterToday()).toEqual(
        0
      );
    });
  });
});

describe("daysBeforeDate", () => {
  const givenDate = DateTimeWithTimeZone.from("2020-09-15T00:00:00+1000");

  describe("when date is before given date", () => {
    it("should return positive integer", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-14T00:00:00+1000").daysBeforeDate(
          givenDate
        )
      ).toEqual(1);
      expect(
        DateTimeWithTimeZone.from("2020-09-14T23:59:59+1000").daysBeforeDate(
          givenDate
        )
      ).toEqual(1);
      expect(
        DateTimeWithTimeZone.from("2020-09-14").daysBeforeDate(givenDate)
      ).toEqual(1);
    });
  });
  describe("when date is after given date", () => {
    it("should return negative integer", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-16T00:00:00+1000").daysBeforeDate(
          givenDate
        )
      ).toEqual(-1);
      expect(
        DateTimeWithTimeZone.from("2020-09-16T23:59:59+1000").daysBeforeDate(
          givenDate
        )
      ).toEqual(-1);
      expect(
        DateTimeWithTimeZone.from("2020-09-16").daysBeforeDate(givenDate)
      ).toEqual(-1);
    });
  });
  describe("when date is the same as given date", () => {
    it("should return zero", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-15T00:00:00+1000").daysBeforeDate(
          givenDate
        )
      ).toEqual(0);
      expect(
        DateTimeWithTimeZone.from("2020-09-15T23:59:59+1000").daysBeforeDate(
          givenDate
        )
      ).toEqual(0);
      expect(
        DateTimeWithTimeZone.from("2020-09-15").daysBeforeDate(givenDate)
      ).toEqual(0);
    });
  });
});

describe("daysAfterToday", () => {
  const givenDate = DateTimeWithTimeZone.from("2020-09-15T00:00:00+1000");
  // eslint-disable-next-line jest/no-identical-title
  describe("when date is before given date", () => {
    it("should return negative integer", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-14T00:00:00+1000").daysAfterDate(
          givenDate
        )
      ).toEqual(-1);
      expect(
        DateTimeWithTimeZone.from("2020-09-14T23:59:59+1000").daysAfterDate(
          givenDate
        )
      ).toEqual(-1);
      expect(
        DateTimeWithTimeZone.from("2020-09-14").daysAfterDate(givenDate)
      ).toEqual(-1);
    });
  });

  // eslint-disable-next-line jest/no-identical-title
  describe("when date is after given date", () => {
    it("should return positive integer", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-16T00:00:00+1000").daysAfterDate(
          givenDate
        )
      ).toEqual(1);
      expect(
        DateTimeWithTimeZone.from("2020-09-16T23:59:59+1000").daysAfterDate(
          givenDate
        )
      ).toEqual(1);
      expect(
        DateTimeWithTimeZone.from("2020-09-16").daysAfterDate(givenDate)
      ).toEqual(1);
    });
  });

  // eslint-disable-next-line jest/no-identical-title
  describe("when date is the same as given date", () => {
    it("should return zero", () => {
      expect(
        DateTimeWithTimeZone.from("2020-09-15T00:00:00+1000").daysAfterDate(
          givenDate
        )
      ).toEqual(0);
      expect(
        DateTimeWithTimeZone.from("2020-09-15T23:59:59+1000").daysAfterDate(
          givenDate
        )
      ).toEqual(0);
      expect(
        DateTimeWithTimeZone.from("2020-09-15").daysAfterDate(givenDate)
      ).toEqual(0);
    });
  });
});
