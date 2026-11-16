import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LanguageToggle } from "@/components/attempt/language-toggle";

describe("LanguageToggle", () => {
  it("reflects the selected language", () => {
    render(<LanguageToggle language="ml" onLanguageChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "മലയാളം" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "English" })).not.toBeChecked();
  });

  it("switches language", async () => {
    const onChange = vi.fn();
    render(
      <LanguageToggle language="en" onLanguageChange={onChange} className="x" />
    );
    await userEvent.click(screen.getByRole("radio", { name: "മലയാളം" }));
    expect(onChange).toHaveBeenCalledWith("ml");
    await userEvent.click(screen.getByRole("radio", { name: "English" }));
    expect(onChange).toHaveBeenCalledWith("en");
  });
});
