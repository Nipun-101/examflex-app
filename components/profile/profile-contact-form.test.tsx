import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfileContactForm } from "@/components/profile/profile-contact-form";

type Props = React.ComponentProps<typeof ProfileContactForm>;

function renderForm(overrides: Partial<Props> = {}) {
  const props: Props = {
    title: "How we reach you",
    subtitle: "Placeholders",
    values: { name: "Aarav", phone: "9876543210", email: "a@b.co" },
    errors: {},
    dirty: false,
    phoneLocked: true,
    emailLocked: true,
    saveLabel: "Save details",
    resetLabel: "Reset",
    onChange: vi.fn(),
    onSave: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
  const view = render(<ProfileContactForm {...props} />);
  return { props, ...view };
}

describe("ProfileContactForm", () => {
  it("saves, resets, and surfaces field errors", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSave = vi.fn();
    const onReset = vi.fn();

    const { rerender, props } = renderForm({
      errors: { name: "Name needs at least 2 characters." },
      dirty: true,
      onChange,
      onSave,
      onReset,
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Name needs at least 2 characters."
    );

    await user.type(screen.getByLabelText("Full name"), "x");
    expect(onChange).toHaveBeenCalledWith("name", expect.any(String));

    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(onSave).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledTimes(1);

    rerender(<ProfileContactForm {...props} errors={{}} dirty={false} />);
    expect(screen.getByRole("button", { name: "Save details" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  describe("locked fields", () => {
    it.each([
      ["Mobile", /mobile number is verified/i],
      ["Email", /email address can.t be changed/i],
    ])("%s is disabled, shows the blocked cursor, and explains why", (label, reason) => {
      renderForm();
      const input = screen.getByLabelText(label);
      expect(input).toBeDisabled();
      expect(input.className).toContain("cursor-not-allowed");
      expect(input.getAttribute("title")).toMatch(reason);
    });

    it.each(["Mobile", "Email"])("%s cannot be clicked into or typed in", async (label) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderForm({ onChange });
      const input = screen.getByLabelText(label);

      await user.click(input);
      expect(input).not.toHaveFocus();
      await user.type(input, "123");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("never drops the locked value, so the learner can still read it", () => {
      renderForm({
        values: { name: "Aarav", phone: "9876543210", email: "aarav@gmail.com" },
      });
      expect(screen.getByLabelText("Mobile")).toHaveValue("9876543210");
      expect(screen.getByLabelText("Email")).toHaveValue("aarav@gmail.com");
    });

    it("leaves the name editable", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderForm({ onChange });
      const name = screen.getByLabelText("Full name");
      expect(name).toBeEnabled();
      expect(name.className).not.toContain("cursor-not-allowed");
      expect(name.getAttribute("title")).toBeNull();
      await user.type(name, "x");
      expect(onChange).toHaveBeenCalledWith("name", expect.any(String));
    });
  });

  describe("an email can be added when the account has none", () => {
    it("keeps Email editable while the mobile stays locked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderForm({
        values: { name: "Ada", phone: "9876543210", email: "" },
        emailLocked: false,
        onChange,
      });

      const email = screen.getByLabelText("Email");
      expect(email).toBeEnabled();
      expect(email.className).not.toContain("cursor-not-allowed");
      expect(email.getAttribute("title")).toBeNull();
      await user.type(email, "a");
      expect(onChange).toHaveBeenCalledWith("email", "a");

      expect(screen.getByLabelText("Mobile")).toBeDisabled();
    });
  });
});
