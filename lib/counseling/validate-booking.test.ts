import { describe, expect, it } from "vitest";
import type { CounselingBookingForm } from "@/types/counseling";
import {
  hasCounselingBookingErrors,
  toCreateCounselingPayload,
  validateCounselingBooking,
} from "./validate-booking";

function form(
  overrides: Partial<CounselingBookingForm> = {}
): CounselingBookingForm {
  return {
    studentName: "Riya",
    whoWillJoin: "student",
    courseInterestedIn: "NEET UG",
    expectedMark: "",
    twelfthMarks: "",
    state: "",
    category: "",
    preferredDayTime: "",
    talkAbout: "",
    contact: {
      emailEnabled: true,
      email: "riya@example.com",
      phoneEnabled: false,
      phone: "",
    },
    ...overrides,
  };
}

describe("validateCounselingBooking", () => {
  it("accepts email-only contact", () => {
    expect(validateCounselingBooking(form())).toEqual({});
  });

  it("requires at least one contact channel", () => {
    const errors = validateCounselingBooking(
      form({
        contact: {
          emailEnabled: false,
          email: "",
          phoneEnabled: false,
          phone: "",
        },
      })
    );
    expect(errors.contact).toBeTruthy();
    expect(hasCounselingBookingErrors(errors)).toBe(true);
  });

  it("validates phone digits when phone is enabled", () => {
    const errors = validateCounselingBooking(
      form({
        contact: {
          emailEnabled: false,
          email: "",
          phoneEnabled: true,
          phone: "123",
        },
      })
    );
    expect(errors.phone).toMatch(/10-digit/i);
  });
});

describe("toCreateCounselingPayload", () => {
  it("omits blank optional fields and formats phone", () => {
    expect(
      toCreateCounselingPayload(
        form({
          studentName: "  ",
          talkAbout: "Colleges",
          contact: {
            emailEnabled: false,
            email: "",
            phoneEnabled: true,
            phone: "9876543210",
          },
        })
      )
    ).toEqual({
      whoWillJoin: "student",
      courseInterestedIn: "NEET UG",
      talkAbout: "Colleges",
      contact: {
        emailEnabled: false,
        phoneEnabled: true,
        phone: "+919876543210",
      },
    });
  });
});
