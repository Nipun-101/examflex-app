import { describe, expect, it } from "vitest";
import { sanitizeAttemptRichText } from "@/lib/mocks/sanitize-attempt-text";

describe("sanitizeAttemptRichText", () => {
  it("strips split itemize wrappers from MCQ options", () => {
    expect(
      sanitizeAttemptRichText(
        " \\begin{itemize} \\item[(1)] Both statement (I) and statement (II) are correct"
      )
    ).toBe("Both statement (I) and statement (II) are correct");
    expect(
      sanitizeAttemptRichText(
        " \\item[(3)] Both statement (I) and statement (II) are incorrect"
      )
    ).toBe("Both statement (I) and statement (II) are incorrect");
    expect(
      sanitizeAttemptRichText(
        " \\item[(4)] Statement (I) is incorrect but statement (II) is correct \\end{itemize}"
      )
    ).toBe("Statement (I) is incorrect but statement (II) is correct");
  });

  it("leaves normal option and math text alone", () => {
    expect(sanitizeAttemptRichText("205.3 m")).toBe("205.3 m");
    expect(
      sanitizeAttemptRichText(" (2) $\\left[\\mathrm{M}^{0} \\mathrm{~L}^{2}\\right]$")
    ).toBe("(2) $\\left[\\mathrm{M}^{0} \\mathrm{~L}^{2}\\right]$");
  });
});
