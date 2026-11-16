import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfileContactForm } from "@/components/profile/profile-contact-form";

describe("ProfileContactForm", () => {
  it("saves, resets, and surfaces field errors", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSave = vi.fn();
    const onReset = vi.fn();

    const { rerender } = render(
      <ProfileContactForm
        title="How we reach you"
        subtitle="Placeholders"
        values={{ name: "Aarav", phone: "9876543210", email: "a@b.co" }}
        errors={{ email: "That email does not look right." }}
        dirty
        phoneLocked
        saveLabel="Save details"
        resetLabel="Reset"
        onChange={onChange}
        onSave={onSave}
        onReset={onReset}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "That email does not look right."
    );
    expect(screen.getByLabelText("Mobile")).toHaveAttribute("readonly");

    await user.type(screen.getByLabelText("Full name"), "x");
    expect(onChange).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(onSave).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledTimes(1);

    rerender(
      <ProfileContactForm
        title="How we reach you"
        subtitle="Placeholders"
        values={{ name: "Aarav", phone: "9876543210", email: "a@b.co" }}
        errors={{}}
        dirty={false}
        phoneLocked
        saveLabel="Save details"
        resetLabel="Reset"
        onChange={onChange}
        onSave={onSave}
        onReset={onReset}
      />
    );

    expect(screen.getByRole("button", { name: "Save details" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  it("allows editing phone when unlocked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ProfileContactForm
        title="How we reach you"
        subtitle="Add a mobile"
        values={{ name: "Ada", phone: "", email: "ada@examflex.in" }}
        errors={{}}
        dirty={false}
        phoneLocked={false}
        saveLabel="Save details"
        resetLabel="Reset"
        onChange={onChange}
        onSave={vi.fn()}
        onReset={vi.fn()}
      />
    );

    const phone = screen.getByLabelText("Mobile");
    expect(phone).not.toHaveAttribute("readonly");
    await user.type(phone, "9");
    expect(onChange).toHaveBeenCalled();
  });

  it("omits phone onChange when locked", () => {
    render(
      <ProfileContactForm
        title="How we reach you"
        subtitle="Locked mobile"
        values={{ name: "Ada", phone: "9876543210", email: "ada@examflex.in" }}
        errors={{}}
        dirty={false}
        phoneLocked
        saveLabel="Save details"
        resetLabel="Reset"
        onChange={vi.fn()}
        onSave={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Mobile")).toHaveAttribute("readonly");
  });
});
