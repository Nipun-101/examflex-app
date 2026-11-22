import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OtpCodeInput } from "@/components/auth/otp-code-input";

function Harness({ onComplete }: { onComplete?: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <OtpCodeInput
      value={value}
      length={4}
      onChange={setValue}
      {...(onComplete ? { onComplete } : {})}
      label="4-digit verification code"
      slotClassName="slot"
      activeSlotClassName="slot-active"
    />
  );
}

describe("OtpCodeInput", () => {
  afterEach(cleanup);

  it("renders one box per digit over a single labelled input", () => {
    render(<Harness />);
    const input = screen.getByLabelText("4-digit verification code");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByTestId("otp-code-input").querySelectorAll(".slot")).toHaveLength(4);
  });

  it("shows typed digits, keeps digits only and caps the length", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText("4-digit verification code");
    await user.type(input, "1a2b3");
    expect(input).toHaveValue("123");
    expect(screen.getByTestId("otp-code-input")).toHaveTextContent("123");
  });

  it("fires onComplete once the last digit is entered, including on paste", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const input = screen.getByLabelText("4-digit verification code");
    await user.click(input);
    await user.paste("12 34 56");
    expect(onComplete).toHaveBeenCalledWith("1234");
    expect(input).toHaveValue("1234");
  });

  it("highlights the active box only while focused, and honours disabled", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <OtpCodeInput
        value="12"
        length={4}
        onChange={() => undefined}
        label="code"
        slotClassName="slot"
        activeSlotClassName="slot-active"
      />
    );
    const root = screen.getByTestId("otp-code-input");
    expect(root.querySelectorAll(".slot-active")).toHaveLength(0);
    await user.click(screen.getByLabelText("code"));
    expect(root.querySelectorAll(".slot-active")).toHaveLength(1);

    rerender(
      <OtpCodeInput
        value="12"
        length={4}
        onChange={() => undefined}
        disabled
        invalid
        label="code"
        slotClassName="slot"
        activeSlotClassName="slot-active"
      />
    );
    expect(screen.getByLabelText("code")).toBeDisabled();
    expect(screen.getByLabelText("code")).toHaveAttribute("aria-invalid", "true");
  });
});
